import puppeteer, { Browser, Page } from 'puppeteer';
import { logger } from '../utils/logger';
import { IWebKioskCredentials, ISubject, IExamMark, ISGPACGPAData } from '../types';

export class WebKioskScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private baseUrl: string;
  private loginUrl: string;

  constructor() {
    this.baseUrl = process.env.WEBKIOSK_BASE_URL || 'https://webkiosk.juet.ac.in';
    this.loginUrl = process.env.WEBKIOSK_LOGIN_URL || 'https://webkiosk.juet.ac.in/CommonFiles/UserAction.jsp';
  }

  // Initialize browser and page
  async initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: process.env.NODE_ENV === 'production',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      });

      this.page = await this.browser.newPage();
      
      // Set user agent
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Set viewport
      await this.page.setViewport({ width: 1366, height: 768 });

      logger.info('WebKiosk scraper initialized');
    } catch (error) {
      logger.error('Failed to initialize WebKiosk scraper:', error);
      throw error;
    }
  }

  // Login to WebKiosk
  async login(credentials: IWebKioskCredentials): Promise<boolean> {
    try {
      if (!this.page) await this.initialize();

      logger.info(`Attempting login for ${credentials.enrollmentNumber}`);

      // Navigate to login page
      await this.page!.goto(this.loginUrl, { waitUntil: 'networkidle2' });

      // Select Student from dropdown
      await this.page!.select('select[name="UserType"]', 'S');

      // Fill login form with exact field names from WebKiosk
      await this.page!.type('input[name="MemberCode"]', credentials.enrollmentNumber);
      await this.page!.type('input[name="Password"]', credentials.password);
      await this.page!.type('input[name="DATE1"]', credentials.dateOfBirth);

      // Get captcha text directly from HTML (it's just styled text, no image OCR needed)
      const captchaText = await this.page!.$eval('.noselect', el => 
        el.textContent?.replace(/[^a-zA-Z0-9]/g, '') || ''
      );
      
      logger.info(`Captcha text extracted: ${captchaText}`);
      await this.page!.type('input[name="txtcap"]', captchaText);

      // Submit form
      await Promise.all([
        this.page!.waitForNavigation({ waitUntil: 'networkidle2' }),
        this.page!.click('input[name="BTNSubmit"]'),
      ]);

      // Check if login was successful
      const currentUrl = this.page!.url();
      const isLoginSuccessful = !currentUrl.includes('UserAction.jsp') && !currentUrl.includes('login');

      if (isLoginSuccessful) {
        logger.info(`Login successful for ${credentials.enrollmentNumber}`);
        return true;
      } else {
        logger.error(`Login failed for ${credentials.enrollmentNumber}`);
        return false;
      }
    } catch (error) {
      logger.error(`Login error for ${credentials.enrollmentNumber}:`, error);
      return false;
    }
  }

  // Scrape attendance data
  async scrapeAttendance(): Promise<ISubject[]> {
    try {
      if (!this.page) throw new Error('Page not initialized or not logged in');

      logger.info('Scraping attendance data');

      // Navigate to attendance page
      await this.page.goto(`${this.baseUrl}/StudentFiles/StudentAttendance.jsp`, { 
        waitUntil: 'networkidle2' 
      });

      // Wait for attendance table
      await this.page.waitForSelector('table, .attendance-table', { timeout: 15000 });

      // Extract attendance data
      const attendanceData = await this.page.evaluate(() => {
        const subjects: ISubject[] = [];
        const tables = document.querySelectorAll('table');
        
        // Find the correct attendance table
        let attendanceTable: Element | null = null;
        for (const table of tables) {
          const headerText = table.textContent || '';
          if (headerText.includes('Subject') || headerText.includes('Attendance')) {
            attendanceTable = table;
            break;
          }
        }

        if (!attendanceTable) return subjects;

        const rows = attendanceTable.querySelectorAll('tr');
        
        for (let i = 1; i < rows.length; i++) { // Skip header row
          const cells = rows[i].querySelectorAll('td, th');
          
          if (cells.length >= 6) {
            const subjectCode = cells[0]?.textContent?.trim() || '';
            const subjectName = cells[1]?.textContent?.trim() || '';
            const lecturesText = cells[2]?.textContent?.trim() || '0/0';
            const tutorialsText = cells[3]?.textContent?.trim() || '0/0';
            const practicalsText = cells[4]?.textContent?.trim() || '0/0';
            const percentageText = cells[5]?.textContent?.trim() || '0';

            const parseLectures = (text: string) => {
              const match = text.match(/(\d+)\/(\d+)/);
              return match ? { attended: parseInt(match[1]), total: parseInt(match[2]) } : { attended: 0, total: 0 };
            };

            const lectures = parseLectures(lecturesText);
            const tutorials = parseLectures(tutorialsText);
            const practicals = parseLectures(practicalsText);

            subjects.push({
              subjectId: `${subjectCode}_${Date.now()}`,
              name: subjectName,
              code: subjectCode,
              faculty: '', // Will be populated from other sources
              attendance: {
                lectures,
                tutorials,
                practicals,
              },
              percentage: parseFloat(percentageText.replace('%', '')) || 0,
              semester: 0, // Will be set from user data
              credits: 0, // Will be populated from other sources
            });
          }
        }

        return subjects;
      });

      logger.info(`Scraped ${attendanceData.length} subjects attendance data`);
      return attendanceData;
    } catch (error) {
      logger.error('Failed to scrape attendance:', error);
      throw error;
    }
  }

  // Scrape exam marks
  async scrapeExamMarks(): Promise<IExamMark[]> {
    try {
      if (!this.page) throw new Error('Page not initialized or not logged in');

      logger.info('Scraping exam marks data');

      // Navigate to exam marks page
      await this.page.goto(`${this.baseUrl}/StudentFiles/ExamResult.jsp`, { 
        waitUntil: 'networkidle2' 
      });

      // Wait for marks table
      await this.page.waitForSelector('table, .marks-table', { timeout: 15000 });

      // Extract exam marks data
      const examMarks = await this.page.evaluate(() => {
        const marks: Partial<IExamMark>[] = [];
        const tables = document.querySelectorAll('table');
        
        for (const table of tables) {
          const rows = table.querySelectorAll('tr');
          
          for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].querySelectorAll('td, th');
            
            if (cells.length >= 5) {
              const subjectCode = cells[0]?.textContent?.trim() || '';
              const subjectName = cells[1]?.textContent?.trim() || '';
              const marksText = cells[2]?.textContent?.trim() || '0';
              const maxMarksText = cells[3]?.textContent?.trim() || '100';
              const examType = cells[4]?.textContent?.trim() || 'T1';

              marks.push({
                subjectCode,
                subjectName,
                marksObtained: parseFloat(marksText) || 0,
                maxMarks: parseFloat(maxMarksText) || 100,
                examType: examType as any,
                examDate: new Date(),
                publishedDate: new Date(),
              });
            }
          }
        }

        return marks;
      });

      logger.info(`Scraped ${examMarks.length} exam marks`);
      return examMarks as IExamMark[];
    } catch (error) {
      logger.error('Failed to scrape exam marks:', error);
      throw error;
    }
  }

  // Scrape SGPA/CGPA data
  async scrapeSGPACGPA(): Promise<ISGPACGPAData[]> {
    try {
      if (!this.page) throw new Error('Page not initialized or not logged in');

      logger.info('Scraping SGPA/CGPA data');

      // Navigate to results page
      await this.page.goto(`${this.baseUrl}/StudentFiles/StudentResult.jsp`, { 
        waitUntil: 'networkidle2' 
      });

      // Wait for results table
      await this.page.waitForSelector('table, .results-table', { timeout: 15000 });

      // Extract SGPA/CGPA data
      const sgpaCgpaData = await this.page.evaluate(() => {
        const results: Partial<ISGPACGPAData>[] = [];
        const tables = document.querySelectorAll('table');
        
        for (const table of tables) {
          const rows = table.querySelectorAll('tr');
          
          for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].querySelectorAll('td, th');
            
            if (cells.length >= 4) {
              const semester = parseInt(cells[0]?.textContent?.trim() || '0');
              const sgpa = parseFloat(cells[1]?.textContent?.trim() || '0');
              const cgpa = parseFloat(cells[2]?.textContent?.trim() || '0');
              const credits = parseInt(cells[3]?.textContent?.trim() || '0');

              if (semester > 0) {
                results.push({
                  semester,
                  sgpa,
                  cgpa,
                  credits,
                  gradePoints: sgpa * credits,
                  subjects: [],
                  academicYear: `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`,
                  publishedDate: new Date(),
                });
              }
            }
          }
        }

        return results;
      });

      logger.info(`Scraped SGPA/CGPA data for ${sgpaCgpaData.length} semesters`);
      return sgpaCgpaData as ISGPACGPAData[];
    } catch (error) {
      logger.error('Failed to scrape SGPA/CGPA:', error);
      throw error;
    }
  }

  // Cleanup resources
  async cleanup(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      
      logger.info('WebKiosk scraper cleaned up');
    } catch (error) {
      logger.error('Error during WebKiosk scraper cleanup:', error);
    }
  }

  // Full sync method
  async syncAllData(credentials: IWebKioskCredentials): Promise<{
    attendance: ISubject[];
    examMarks: IExamMark[];
    sgpaCgpa: ISGPACGPAData[];
  }> {
    try {
      const loginSuccess = await this.login(credentials);
      
      if (!loginSuccess) {
        throw new Error('Login failed');
      }

      const [attendance, examMarks, sgpaCgpa] = await Promise.all([
        this.scrapeAttendance(),
        this.scrapeExamMarks(),
        this.scrapeSGPACGPA(),
      ]);

      return {
        attendance,
        examMarks,
        sgpaCgpa,
      };
    } catch (error) {
      logger.error('Full sync failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}
