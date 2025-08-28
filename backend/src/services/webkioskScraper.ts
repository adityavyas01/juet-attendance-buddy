import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger';
import { IWebKioskCredentials, ISubject, IExamMark, ISGPACGPAData } from '../types';

export class WebKioskScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private baseUrl: string;
  private loginUrl: string;
  private enrollmentNumber: string | null = null;

  constructor() {
    this.baseUrl = process.env.WEBKIOSK_BASE_URL || 'https://webkiosk.juet.ac.in';
    this.loginUrl = process.env.WEBKIOSK_LOGIN_URL || 'https://webkiosk.juet.ac.in/';
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

      // Store enrollment number for later use
      this.enrollmentNumber = credentials.enrollmentNumber;

      logger.info(`Attempting login for ${credentials.enrollmentNumber}`);

      // First, try to go to the base URL and see if we get redirected to the login page
      await this.page!.goto(this.baseUrl, { waitUntil: 'networkidle2' });

      let pageTitle = await this.page!.title();
      let currentUrl = this.page!.url();
      logger.info(`Initial page - Title: ${pageTitle}, URL: ${currentUrl}`);

      // If we're already on UserAction.jsp, we need to go back to the main page
      if (currentUrl.includes('UserAction.jsp')) {
        logger.info('Redirected to UserAction.jsp, trying to navigate back to login...');
        
        // Try to navigate to the root page
        await this.page!.goto(this.baseUrl, { waitUntil: 'networkidle2' });
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        currentUrl = this.page!.url();
        pageTitle = await this.page!.title();
        logger.info(`After redirect - Title: ${pageTitle}, URL: ${currentUrl}`);
      }

      // Check if we have the login form on the current page
      const hasLoginForm = await this.page!.evaluate(() => {
        const form = document.querySelector('form[name="LoginForm"]');
        const userTypeSelect = document.querySelector('select[name="UserType"]');
        const memberCodeInput = document.querySelector('input[name="MemberCode"]');
        return form && userTypeSelect && memberCodeInput;
      });

      if (!hasLoginForm) {
        logger.error('Login form not found on the page');
        
        // Debug: Log the current page content
        const pageContent = await this.page!.content();
        logger.info(`Page content (first 1000 chars): ${pageContent.substring(0, 1000)}`);
        
        // Try to look for any forms
        const forms = await this.page!.evaluate(() => {
          const formElements = document.querySelectorAll('form');
          const results = [];
          for (let i = 0; i < formElements.length; i++) {
            const form = formElements[i];
            results.push({
              name: form.getAttribute('name'),
              action: form.getAttribute('action'),
              method: form.getAttribute('method'),
              id: form.getAttribute('id')
            });
          }
          return results;
        });
        logger.info(`Forms found: ${JSON.stringify(forms)}`);
        
        throw new Error('Login form not found on the page');
      }

      logger.info('Login form found, proceeding with login...');

      // Select "Student" user type
      await this.page!.select('select[name="UserType"]', 'S');
      logger.info('Selected Student user type');

      // Wait for any dynamic changes
      await new Promise(resolve => setTimeout(resolve, 500));

      // Fill enrollment number
      await this.page!.type('input[name="MemberCode"]', credentials.enrollmentNumber);
      logger.info(`Filled enrollment number: ${credentials.enrollmentNumber}`);

      // Fill date of birth
      await this.page!.type('input[name="DATE1"]', credentials.dateOfBirth);
      logger.info(`Filled date of birth: ${credentials.dateOfBirth}`);

      // Fill password
      await this.page!.type('input[name="Password"]', credentials.password);
      logger.info('Filled password');

      // Handle captcha - extract text from the captcha element
      try {
        const captchaText = await this.page!.evaluate(() => {
          // Based on the HTML, the captcha is in: <s><i><font class="noselect" size="5">lRShR</font></i></s>
          const captchaElement = document.querySelector('font.noselect');
          if (captchaElement) {
            // Get the text content and clean it up
            let text = captchaElement.textContent || '';
            // Remove any extra whitespace but keep the alphanumeric characters
            text = text.trim();
            return text;
          }
          
          // Fallback: try other selectors
          const altElement = document.querySelector('.noselect');
          if (altElement) {
            let text = altElement.textContent || '';
            text = text.trim();
            return text;
          }
          
          return '';
        });

        if (captchaText) {
          logger.info(`Extracted captcha: "${captchaText}"`);
          await this.page!.type('input[name="txtcap"]', captchaText);
          logger.info('Filled captcha');
        } else {
          logger.warn('Could not extract captcha text');
          
          // Debug: log the captcha area HTML
          const captchaAreaHTML = await this.page!.evaluate(() => {
            const captchaTable = document.querySelector('table[bgcolor="#D5D6D8"]');
            return captchaTable ? captchaTable.outerHTML : 'Captcha table not found';
          });
          logger.info(`Captcha area HTML: ${captchaAreaHTML}`);
        }
      } catch (captchaError) {
        logger.warn('Captcha element not found or could not extract text:', captchaError);
      }

      // Click submit button
      await this.page!.click('input[name="BTNSubmit"]');
      logger.info('Clicked submit button');

      // Wait for navigation
      try {
        await this.page!.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
      } catch (navError) {
        logger.warn('Navigation timeout, checking current state...');
      }

      // Check if login was successful by looking at the current URL and page content
      const finalUrl = this.page!.url();
      const finalTitle = await this.page!.title();
      const pageContent = await this.page!.content();

      logger.info(`After login attempt - URL: ${finalUrl}, Title: ${finalTitle}`);

      // Look for success indicators - successful login should redirect away from the main login page
      // and not stay on UserAction.jsp if there's an error
      const isStillOnLoginPage = finalUrl.includes('webkiosk.juet.ac.in/') && 
                                 finalUrl === this.baseUrl ||
                                 finalUrl === this.baseUrl + '/';
      
      const isOnErrorPage = finalUrl.includes('UserAction.jsp') && 
                           (pageContent.includes('Invalid') || 
                            pageContent.includes('Error') || 
                            pageContent.includes('Login failed') ||
                            pageContent.includes('Please Input valid') ||
                            pageContent.includes('Incorrect'));

      // Check for successful redirection patterns
      const successfulRedirectPatterns = [
        'StudentFiles',
        'Student/',
        'welcome.jsp',
        'main.jsp',
        'portal',
        'dashboard'
      ];

      const hasSuccessfulRedirect = successfulRedirectPatterns.some(pattern => 
        finalUrl.toLowerCase().includes(pattern.toLowerCase())
      );

      // Check for success content indicators
      const successContentIndicators = [
        'Welcome',
        'Dashboard', 
        'Student Portal',
        'Attendance',
        'Academic',
        'Profile',
        'Menu'
      ];

      const hasSuccessContent = successContentIndicators.some(indicator => 
        pageContent.toLowerCase().includes(indicator.toLowerCase()) ||
        finalTitle.toLowerCase().includes(indicator.toLowerCase())
      );

      const isLoginSuccessful = (hasSuccessfulRedirect || hasSuccessContent) && 
                                !isOnErrorPage && 
                                !isStillOnLoginPage;

      if (isLoginSuccessful) {
        logger.info(`Login successful for ${credentials.enrollmentNumber}`);
        logger.info(`Redirected to: ${finalUrl}`);
        return true;
      } else {
        logger.error(`Login failed for ${credentials.enrollmentNumber}`);
        logger.error(`Final URL: ${finalUrl}, Title: ${finalTitle}`);
        logger.error(`Still on login page: ${isStillOnLoginPage}, On error page: ${isOnErrorPage}`);
        
        // Log page content for debugging
        logger.info(`Page content (first 500 chars): ${pageContent.substring(0, 500)}`);
        
        // Look for specific error messages
        const errorMessages = await this.page!.evaluate(() => {
          const results = [];
          
          // Check for JavaScript alerts in script tags
          const scripts = document.querySelectorAll('script');
          for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            if (script.textContent && script.textContent.includes('alert')) {
              results.push(`Alert in script: ${script.textContent.substring(0, 200)}`);
            }
          }
          
          // Check for common error text in body
          const bodyText = document.body ? document.body.textContent || '' : '';
          const errorKeywords = ['Invalid', 'Error', 'Failed', 'Incorrect', 'Please Input valid'];
          
          for (const keyword of errorKeywords) {
            if (bodyText.includes(keyword)) {
              const index = bodyText.indexOf(keyword);
              const context = bodyText.substring(Math.max(0, index - 50), index + 150);
              results.push(`Error context: ${context}`);
              break;
            }
          }
          
          return results;
        });
        
        if (errorMessages.length > 0) {
          logger.error(`Error messages found: ${JSON.stringify(errorMessages)}`);
        }

        return false;
      }
    } catch (error) {
      logger.error(`Login error for ${credentials.enrollmentNumber}:`, error);
      return false;
    }
  }

  // Scrape attendance data
  async scrapeAttendance(): Promise<{subjects: ISubject[], studentInfo: any, tableFound: boolean, error?: string}> {
    try {
      if (!this.page) throw new Error('Page not initialized or not logged in');

      logger.info('Scraping attendance data');

      // Navigate to attendance page - correct URL based on the menu structure
      const attendanceUrl = `${this.baseUrl}/StudentFiles/Academic/StudentAttendanceList.jsp`;
      await this.page.goto(attendanceUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      logger.info(`Navigated to attendance page: ${attendanceUrl}`);

      // Wait for the page to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check the current URL and page content
      const currentUrl = this.page.url();
      const pageTitle = await this.page.title();
      logger.info(`Attendance page - URL: ${currentUrl}, Title: ${pageTitle}`);

      // Debug: Log what tables are actually on the page
      const pageDebugInfo = await this.page.evaluate(function() {
        var allTables = document.querySelectorAll('table');
        var tableInfo = [];
        
        for (var i = 0; i < allTables.length; i++) {
          var table = allTables[i];
          tableInfo.push({
            index: i,
            id: table.id || 'no-id',
            className: table.className || 'no-class',
            rules: table.getAttribute('rules') || 'no-rules',
            rowCount: table.querySelectorAll('tr').length,
            hasTableBody: !!table.querySelector('tbody'),
            innerHTML: table.innerHTML.substring(0, 500) // First 500 chars of table content
          });
        }
        
        return {
          totalTables: allTables.length,
          tables: tableInfo,
          pageText: document.body ? document.body.textContent.substring(0, 1000) : 'No body'
        };
      });

      logger.info(`Page debug info: ${JSON.stringify(pageDebugInfo, null, 2)}`);

      // Parse attendance data using Cheerio (no JavaScript evaluation needed)
      const pageContent = await this.page.content();
      const $ = cheerio.load(pageContent);
      
      const results: ISubject[] = [];
      let studentInfo = {};
      
      try {
        // Find table-1 using Cheerio
        const table = $('#table-1');
        
        if (table.length === 0) {
          return { subjects: [], studentInfo: {}, tableFound: false, error: 'Table not found' };
        }

        // Process each row starting from index 1 (skip header)
        table.find('tr').each((i, row) => {
          if (i === 0) return; // Skip header row
          
          const cells = $(row).find('td');
          
          if (cells.length >= 6) {
            const sno = $(cells[0]).text().trim();
            const subject = $(cells[1]).text().trim();
            const lecTut = $(cells[2]).text().trim();
            const lec = $(cells[3]).text().trim();
            const tut = $(cells[4]).text().trim();
            const prac = $(cells[5]).text().trim();
            
            // Parse subject name and code
            const subjectParts = subject.split(' - ');
            const subjectName = subjectParts[0] ? subjectParts[0].trim() : subject;
            const subjectCode = subjectParts[1] ? subjectParts[1].trim() : '';
            
            // Parse percentages
            const getNumber = (text: string) => {
              const match = text.match(/\d+/);
              return match ? parseInt(match[0], 10) : 0;
            };
            
            const lecTutPct = getNumber(lecTut);
            const lecPct = getNumber(lec);
            const tutPct = getNumber(tut);
            const pracPct = getNumber(prac);
            const overallPct = lecTutPct || lecPct;
            
            // Determine status
            let status: string = 'Good';
            if (overallPct < 75 && overallPct >= 50) status = 'Warning';
            else if (overallPct < 50) status = 'Critical';
            
            // Only add if we have valid data
            if (subjectName && sno) {
              results.push({
                subjectId: subjectCode || `subject-${i}`,
                name: subjectName,
                code: subjectCode,
                faculty: '',
                attendance: {
                  lectures: {
                    attended: Math.round(lecPct * 0.8), // Estimate based on percentage
                    total: lecPct > 0 ? Math.round(lecPct * 0.8 / (lecPct / 100)) : 0
                  },
                  tutorials: {
                    attended: Math.round(tutPct * 0.8),
                    total: tutPct > 0 ? Math.round(tutPct * 0.8 / (tutPct / 100)) : 0
                  },
                  practicals: {
                    attended: Math.round(pracPct * 0.8),
                    total: pracPct > 0 ? Math.round(pracPct * 0.8 / (pracPct / 100)) : 0
                  }
                },
                percentage: overallPct,
                semester: 7, // From student info
                credits: 3 // Default credit value
              });
            }
          }
        });
        
        // Get student info from second table
        const tables = $('table');
        if (tables.length > 1) {
          const infoTable = $(tables[1]);
          const infoRow = infoTable.find('tr').first();
          const infoCells = infoRow.find('td');
          
          if (infoCells.length >= 3) {
            const nameText = $(infoCells[0]).text();
            const courseText = $(infoCells[1]).text();
            const semText = $(infoCells[2]).text();
            
            const nameMatch = nameText.match(/Name:\s*(.+?)\[(.+?)\]/);
            const courseMatch = courseText.match(/Course\/Branch:\s*(.+)/);
            const semMatch = semText.match(/Current Semester:\s*(\d+)/);
            
            studentInfo = {
              name: nameMatch ? nameMatch[1].trim() : '',
              enrollmentNumber: nameMatch ? nameMatch[2].trim() : '',
              course: courseMatch ? courseMatch[1].trim() : '',
              currentSemester: semMatch ? parseInt(semMatch[1], 10) : 0
            };
          }
        }
        
        return {
          subjects: results,
          studentInfo: studentInfo,
          tableFound: true
        };
        
      } catch (error) {
        return {
          subjects: [],
          studentInfo: {},
          error: `Error: ${error instanceof Error ? error.message : String(error)}`,
          tableFound: false
        };
      }

      // Use the data directly instead of awaiting page.evaluate
      const normalizedData = {
        subjects: results,
        studentInfo: studentInfo,
        tableFound: results.length > 0,
        error: results.length === 0 ? 'No attendance data found' : undefined
      };

      logger.info(`Attendance scraping results:`, {
        subjectsFound: normalizedData.subjects.length,
        tableFound: normalizedData.tableFound,
        studentInfo: normalizedData.studentInfo,
        pageUrl: this.page.url(),
        debugInfo: JSON.stringify(normalizedData, null, 2).substring(0, 500)
      });

      if (normalizedData.subjects.length === 0) {
        logger.warn('No attendance data found');
      }
      
      return normalizedData;
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

      // Navigate to exam marks page - correct URL based on the actual structure
      const examMarksUrl = `${this.baseUrl}/StudentFiles/Exam/StudentEventMarksView.jsp`;
      await this.page.goto(examMarksUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      logger.info(`Navigated to exam marks page: ${examMarksUrl}`);

      // Wait for the page to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check the current URL and page content
      const currentUrl = this.page.url();
      const pageTitle = await this.page.title();
      logger.info(`Exam marks page - URL: ${currentUrl}, Title: ${pageTitle}`);

      // First, select the most recent exam (2025EVESEM) if dropdown exists
      try {
        const examDropdown = await this.page.$('select[name="exam"]');
        if (examDropdown) {
          await this.page.select('select[name="exam"]', '2025EVESEM');
          await this.page.click('input[type="submit"][value="Show"]');
          await new Promise(resolve => setTimeout(resolve, 3000));
          logger.info('Selected 2025EVESEM exam and submitted');
        }
      } catch (dropdownError) {
        logger.warn('Could not interact with exam dropdown:', dropdownError);
      }

      // Parse exam marks data using Cheerio
      const pageContent = await this.page.content();
      const $ = cheerio.load(pageContent);
      
      const results: IExamMark[] = [];
      
      try {
        // Find table-1 with exam marks
        const table = $('#table-1');
        
        if (table.length === 0) {
          logger.warn('Exam marks table not found');
          return [];
        }

        // Process each row starting from index 1 (skip header)
        table.find('tbody tr').each((i, row) => {
          const cells = $(row).find('td');
          
          if (cells.length >= 7) { // Sr.No, Subject, P-1, P-2, TEST-1, TEST-2, TEST-3
            const srNo = $(cells[0]).text().trim();
            const subjectText = $(cells[1]).text().trim();
            const p1 = $(cells[2]).text().trim();
            const p2 = $(cells[3]).text().trim();
            const test1 = $(cells[4]).text().trim();
            const test2 = $(cells[5]).text().trim();
            const test3 = $(cells[6]).text().trim();
            
            // Parse subject name and code
            const subjectParts = subjectText.split('- ');
            const subjectName = subjectParts[0] ? subjectParts[0].trim() : subjectText;
            const subjectCode = subjectParts[1] ? subjectParts[1].trim() : '';
            
            // Helper function to parse marks
            const parseMarks = (text: string) => {
              const num = parseFloat(text.trim());
              return isNaN(num) ? 0 : num;
            };
            
            // Only add if we have valid subject data
            if (subjectName && srNo) {
              // Add marks for each exam component that has data
              const examTypes = [
                { type: 'P1', marks: parseMarks(p1), maxMarks: 15 },
                { type: 'P2', marks: parseMarks(p2), maxMarks: 15 },
                { type: 'T1', marks: parseMarks(test1), maxMarks: 15 },
                { type: 'T2', marks: parseMarks(test2), maxMarks: 25 },
                { type: 'T3', marks: parseMarks(test3), maxMarks: 35 }
              ];
              
              examTypes.forEach(exam => {
                if (exam.marks > 0) { // Only add if marks are present
                  results.push({
                    userId: this.enrollmentNumber || '',
                    subjectId: subjectCode || `SUBJ-${i}`,
                    subjectCode: subjectCode || `SUBJ-${i}`,
                    subjectName: subjectName,
                    semester: 7, // Current semester
                    examType: exam.type === 'P1' ? 'T1' : exam.type === 'P2' ? 'T2' : exam.type === 'T1' ? 'T3' : exam.type === 'T2' ? 'FINAL' : 'ASSIGNMENT',
                    marksObtained: exam.marks,
                    maxMarks: exam.maxMarks,
                    percentage: (exam.marks / exam.maxMarks) * 100,
                    grade: exam.marks >= (exam.maxMarks * 0.9) ? 'A+' : exam.marks >= (exam.maxMarks * 0.8) ? 'A' : exam.marks >= (exam.maxMarks * 0.7) ? 'B+' : exam.marks >= (exam.maxMarks * 0.6) ? 'B' : 'C',
                    examDate: new Date(),
                    publishedDate: new Date(),
                  });
                }
              });
            }
          }
        });
        
        logger.info(`Parsed ${results.length} exam mark entries from ${table.find('tbody tr').length} subjects`);
        return results;
        
      } catch (error) {
        logger.error('Error parsing exam marks:', error);
        return [];
      }
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

      // Navigate to SGPA/CGPA page - correct URL based on the menu structure
      const sgpaUrl = `${this.baseUrl}/StudentFiles/Exam/StudCGPAReport.jsp`;
      await this.page.goto(sgpaUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      logger.info(`Navigated to SGPA/CGPA page: ${sgpaUrl}`);

      // Wait for the page to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check the current URL and page content
      const currentUrl = this.page.url();
      const pageTitle = await this.page.title();
      logger.info(`SGPA page - URL: ${currentUrl}, Title: ${pageTitle}`);

      // Extract SGPA/CGPA data
      const sgpaCgpaData = await this.page.evaluate(() => {
        const results: Partial<ISGPACGPAData>[] = [];
        const tables = document.querySelectorAll('table');
        
        for (let i = 0; i < tables.length; i++) {
          const table = tables[i];
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
                  userId: '',
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

      // Add userId to each result
      const completeSgpaCgpaData = sgpaCgpaData.map(data => ({
        ...data,
        userId: this.enrollmentNumber || '',
      })) as ISGPACGPAData[];

      logger.info(`Scraped SGPA/CGPA data for ${completeSgpaCgpaData.length} semesters`);
      return completeSgpaCgpaData;
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
        attendance: attendance.subjects,
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

  // Convenience methods for API routes
  async getAttendanceData(): Promise<ISubject[]> {
    const result = await this.scrapeAttendance();
    return result.subjects;
  }

  async getSGPACGPAData(): Promise<ISGPACGPAData[]> {
    return await this.scrapeSGPACGPA();
  }

  async getUserProfile(): Promise<any> {
    // For now, return null as we don't have a specific profile scraping method
    // This would need to be implemented based on WebKiosk's profile page structure
    return null;
  }
}
