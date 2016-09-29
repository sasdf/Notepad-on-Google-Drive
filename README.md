# Notepad-on-Google-Drive
A public notepad service inspired by notepad.cc
Hosting on google scripts, google spreadsheet &amp; github pages

Live Demo: https://pads.tk/

# Requirement
  * Google Drive & Google scripts -- Database & Backend
  * Static hosting (i.e Github page) -- User interface & Custom domain hosting
  * Domain (i.e Freenom) -- Domain registrar
  * CloudFlare -- HTTPS & CDN
Free plans are available for all the hosting services list above.

# Installation
### Backend
  1. Create new Project on [Google Apps Script](script.google.com).
  2. Copy all Files in src/GoogleScripts/ to the project.
  3. Deploying as a web app and copy the app URL.
  
See more about google script web app at [Web Apps](https://developers.google.com/apps-script/guides/web).  

This Script will create an spreadsheet named `Database`. Be sure there's NO other file has same name in your google drive. Google scripts isn't fast, So I assume there's only one file has that name.

### Static files
  1. Create new repo on github.
  2. Upload all file in src/static/ to your repo.
  3. Change index.html's AppUrl variable to yours.
  4. Goto repo's Setting and enable Github Page. 
  5. Enable custom domain.
  
### DNS
  See [Github's tutorial](https://help.github.com/articles/quick-start-setting-up-a-custom-domain/)
  
### HTTPS
  1. Goto Page Rules on Cloudflare
  2. Add new rule for `http://*example.com/*` and select `Always Use HTTPS`
  
# Script URL
```
  GET //AppUrl/?file=[filename]
  Return String: content of the file
  
  Receive file content
```
```
  POST //AppUrl/?file=[filename]&value=[content]
  Return Boolean: Success or not
  
  Submit file content
```

# Internal details of database
  Google Script has some limitation described [here](https://script.google.com/dashboard).  
  Due to the quota of creating files, I decided to use Spreadsheet as a large hash table to storage contents.  
  One spreadsheet can have maximum 2000000 cells, and each cell can have maximum 50000 chars.  
  For convenience, I create the spreadsheet has only one column and 2000000 rows, act as an 1-D array.  
  There's no way to do memory allocation, So Open Addressing is used to handle hash collision.  
  Structure inside the cell is like
  ```
    char * 5           headerSize (Integer String)
    
    char * headerSize  header (JSON)
      ex. {"filename": {pos: 0, end: 1, next: false}}
        pos  indicate data start position in this cell,
        end  indicate data end position in this cell,
        next indicate whether there is more data in next cell,
        
    binarys            data
  ```
