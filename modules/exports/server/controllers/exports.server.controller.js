'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  //Article = mongoose.model('Article'),
  Note = mongoose.model('Note'),
  EmailHistory = mongoose.model('EmailHistory'),
  nodemailer = require('nodemailer'),
  moment = require('moment'),
  email = require("emailjs"),
  Fields = mongoose.model('Fields'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  fs = require('fs'),
  randomstring = require("randomstring"), 
  Datauri = require('datauri'),
  images =  require(path.resolve('./modules/exports/server/controllers/images')),
  dropdoc =  require(path.resolve('./modules/library/server/controllers/dropdoc.server.controller')),
  Docxtemplater = require('docxtemplater');
  
  
  var fields;
  Fields.find().exec(function(error,output){ fields = output;} );

exports.sendNoteByEmail = function (req, res) {
  var query = Note.findOne();
  query.where("_id").equals(req.params.noteId).populate('creator','displayName lastName firstName email').exec(function (err, note) {
    if (err) {
      console.log(err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var subject = "Focus on Intervention  - Note for " + moment(note.date).format('MM/DD/YYYY');
      var body = " <h2><b><center>" + note.title + "</center></b></h2> <br>";
      body += "<b>Date</b> : " + moment(note.date).format('MM/DD/YYYY') + "<br>";
      body += "<b>Creator</b> : " + note.creator.firstName + " " + note.creator.lastName + " (" + note.creator.displayName + ")<br>";
      body += "<b>Type</b> : " + note.type + "<br>";
      body += "<b>Follow up date</b> : " + moment(note.followUp).format('MM/DD/YYYY') + "<br>";
      body += "<b>Content</b><br> <p>" + note.content + "</p>";
      if(note.url !== "")
        body += "<b>File</b> : " + note.url + "<br>";
      
       var server  = email.server.connect({
        user:    req.user.email, 
        password: req.user.emailPassword, 
        host:    "gator2004.hostgator.com", 
        ssl:     true
     });

    // send the message and get a callback with an error or details of the message that was sent
      server.send({
         text:    "", 
         from:    req.user.displayName + " <" + req.user.email + ">", 
         to:      "<" + req.params.email + ">",
         subject: subject,
         attachment: 
        [
           {data:body.replace(/(?:\r\n|\r|\n)/g, '<br />'), alternative:true}
        ]
      }, function(err, message) {
        console.log(err || message); 

      if(!err){
          var email = {
            to: req.params.email, 
            subject: subject,
            content: body,
            user: req.user._id
          };
          documentEmail(email);
          res.json("ok");
        } else {
         res.status(401).send(err); 
        }
      });
    } 
  });
        
  };

exports.customSendNoteByEmail = function (req, res) { 
    var note = req.body;
    var subject = note.title;

   var server  = email.server.connect({
        user:    req.user.email, 
        password: req.user.emailPassword, 
        host:    "gator2004.hostgator.com", 
        ssl:     true
     });
     console.log(note);
     if(note.attach === true)
     {
       note.content += "\n Attachment : " + note.url;
     }
     note.content +="\n---\n"+req.user.signature + "\n" + images.logo + "\n" + images.submit + "  " + images.visit + "</a>\n <div style='font-size:80%'>NOTICE OF CONFIDENTIALITY:  This E-mail is covered by the Electronic Communications\n Privacy Act 18 U.S.C. §§ 2510-2521 and is legally privileged. \n \n The information contained in this transmission is \n confidential and is intended only for the use of the individual or entity named above.  \n If the reader of this message is not the intended recipient, he/she is \n hereby notified that any dissemination, distribution or copying of this \n communication is strictly prohibited.</div>";
     
      server.send({
         from:    req.user.displayName + " <" + req.user.email + ">", 
         to:      note.to,
         cc:      note.cc,
         bcc:     note.bcc,
         subject: note.title,
        attachment: 
        [
           {data:note.content.replace(/(?:\r\n|\r|\n)/g, '<br />'), alternative:true}
        ]
         
      }, function(err, message) {
        console.log(err || message); res.json(err || message); 
          if(!err){
          var email = {
            to: note.to, 
            cc: note.cc,
            bcc: note.bcc,
            title: note.title,
            content: note.content,
            user: req.user._id
          };
          documentEmail(email);
        } else {
          console.log("email fails");
        }
      });
        
};

exports.templateRender = function (req, res) {
  var Article = mongoose.model('Article');
  var query = Article.find();
  for(var i in fields){
    var populate = fields[i].key+".id";
    query.populate(populate);
  }

 query.where('_id').equals(req.params.id).lean().exec(function (err, articles) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
     
      var article = articles[0];
      for(var k in article){
        if(article[k].hasOwnProperty("id")){
          if(article[k].id.type === "date"){
            article[k].value  = moment(article[k].value).format('MM/DD/YYYY');
          }
        }
      }
       //console.log(article);
      var content = fs.readFileSync(req.file.path, "binary");
      var doc = new Docxtemplater(content);
      var set = {};
      
      
      var full_name = article.FirstnameContact.value + " " +  article.LastnameContact.value;

      set = {
       "Full_name" : full_name,
       "First_name":article.FirstnameContact.value, 
       "Last_name" : article.LastnameContact.value , 
       "Title" : article.JobTitleContact.value , 
       //"Company": article.CompanyContact.value, 
       "Email" : article.EmailContact.value , 
       "Address" : article.AddressContact.value, 
       "City" : article.CityContact.value , 
       "State" : article.StateContact.value , 
       "Zip" : article.ZipContact.value , 
       "Phone" : article.PhoneContact.value , 
       "Cell" : article.CellContact.value , 
       "Claim_" : article.ClaimContact.value , 
       "SS_" : article.SSContact.value , 
       "DOB" : article.DOBContact.value , 
       "DOI" : article.DOIContact.value , 
       "doi" : article.DOIContact.value , 
       "Injury" : article.InjuryContact.value, 
       "Job_Title" :  article.JobTitleContact.value , 
       "Company_Name" : article.CompanyNameEmployer.value , 
       "Contact_First_Name" : article.ContactFirstNameEmployer.value , 
       "Contact_Last_Name" : article.ContactLastNameEmployer.value , 
       "Gender_M_or_F" : article.GenderMorFEmployer.value , 
       "Phone1" : article.ContactFirstNameEmployer.value , 
       "fax" : article.faxEmployer.value , 
       "e-mail" : article.emailEmployer.value , 
       "Address1" : article.AddressEmployer.value , 
       "City1" : article.CityEmployer.value , 
       "State1" : article.StateEmployer.value , 
       "Zip1" : article.ZipEmployer.value , 
       "Company_Name1" : article.CompanyNameClaimsRepresentative.value , 
       "First_Name1" : article.FirstNameClaimsRepresentative.value , 
       "Last_Name1" : article.LastNameClaimsRepresentative.value , 
       "Gender_M_or_F1" : article.GenderMorFClaimsRepresentative.value , 
       "Phone2" : article.PhoneClaimsRepresentative.value , 
       "Fax1" : article.FaxClaimsRepresentative.value , 
       "e-mail1" : article.emailClaimsRepresentative.value , 
       "Claims_Assistant" : article.ClaimsAssistantClaimsRepresentative.value , 
       "Claims_Assistant_email" : article.ClaimsAssistantemailClaimsRepresentative.value , 
       "Address2" : article.AddressClaimsRepresentative.value , 
       "City2" : article.CityClaimsRepresentative.value , 
       "State2" : article.StateClaimsRepresentative.value , 
       "Zip2" : article.ZipClaimsRepresentative.value , 
       "Dr_Type" : article.DrTypeTreatingPhysician.value , 
       "Firm" : article.FirmTreatingPhysician.value , 
       "Street_address" : article.StreetaddressTreatingPhysician.value , 
       "City3" : article.CityTreatingPhysician.value , 
       "State3" : article.StateTreatingPhysician.value , 
       "Zip3" : article.ZipTreatingPhysician.value , 
       "Phone3" : article.PhoneTreatingPhysician.value , 
       "Fax2" : article.FaxTreatingPhysician.value , 
       "Medical_Record_" : article.MedicalRecordTreatingPhysician.value , 
       "First_Name2" : article.FirstNameTreatingPhysician.value , 
       "Last_name2" : article.LastnameTreatingPhysician.value ,
       "Gender_M_or_F2" : article.GenderMorFApplicantAtttorney.value , 
       "Firm1" : article.FirmApplicantAtttorney.value , 
       "Address3" : article.AddressApplicantAtttorney.value , 
       "City4" : article.CityApplicantAtttorney.value , 
       "State4" : article.StateApplicantAtttorney.value , 
       "Zip4" : article.ZipApplicantAtttorney.value , 
       "Phone4" : article.PhoneApplicantAtttorney.value , 
       "Fax3" : article.FaxApplicantAtttorney.value , 
       "e-mail4" : article.emailApplicantAtttorney.value , 
       "First_Name3" : article.FirstNameApplicantAtttorney.value , 
       "Last_Name3" : article.LastNameApplicantAtttorney.value , 
       "Gender_M_or_F3" : article.GenderDefenseAttorney.value , 
       "Firm2" : article.FirmDefenseAttorney.value , 
       "Street_address1" : article.StreetaddressDefenseAttorney.value , 
       "City5" : article.CityDefenseAttorney.value , 
       "State5" : article.StateDefenseAttorney.value , 
       "Zip5" : article.ZipDefenseAttorney.value , 
       "Phone5" : article.PhoneDefenseAttorney.value , 
       "Fax5" : article.FaxDefenseAttorney.value , 
       "e-mail3" : article.emailDefenseAttorney.value , 
       "First_Name4" : article.FirstNameDefenseAttorney.value , 
       "Last_Name4" : article.LastNameDefenseAttorney.value ,
       "Service_Requested" : article.ServiceRequestedServiceRequested.value , 
       "Additional_Service_Request" : article.LastnameContact.value , 
       "Program" : article.AdditionalServiceRequestServiceRequested.value , 
       "Date_of_referral" : article.DateofreferralFocusInformation.value , 
       //"Date_assigned" : article.CounselorAssignedFocusInformation.value , 
       "Date_of_Reopen" : article.DateofReopenFocusInformation.value , 
       "Re-open_Service_Request" : article.LastnameContact.value , 
       "Additional_Information" : article.LastnameContact.value , 
       "Date_Cancelled" : article.LastnameContact.value , 
       "Reason_for_cancellation" : article.ReasonforcancellationFocusInformation.value , 
       "North_or_Central_or_Statewide" : article.NorthorCentralorStatewideFocusInformation.value , 
       //"Counselor_Assigned" : article.CounselorAssignedFocusInformation.value , 
       "Date_Closed" : article.DateClosedFocusInformation.value , 
       "Estimated_case_value" : article.EstimatedcasevalueFocusInformation.value , 
       "test 1" : article.LastnameContact.value , 
       "Contact_ID" : article.LastnameContact.value , 
       "Language" : article.LastnameContact.value , 
       "Adding_date" : article.LastnameContact.value , 
       "Adding_application" : article.LastnameContact.value , 
       "Adding_method" : article.LastnameContact.value , 
       "Added_by" : article.LastnameContact.value , 
       "Login_name" : article.LastnameContact.value
      };
      doc.setOptions({delimiters:{start:'«',end:'»'}});
      doc.setData(set);

      doc.render();
      var buf = doc.getZip().generate({type:"nodebuffer"});
      var datauri = new Datauri();
      datauri.format('.docx', buf);
      var fileName = "Export-" + full_name + ".docx";
      var file = {
        buffer : buf,
        originalname : fileName
      };
      /*
      dropdoc.uploadToS3(file,function(err, returnFile){
        console.log(returnFile);
        var fileData = {};
        fileData.case = article._id;
        fileData.versions = [];
        fileData.originalName = returnFile.originalname;
        fileData.key = returnFile.key;
        fileData.url = returnFile.Location;
        fileData.user = req.user._id;
        fileData.LastModify = new Date();
        dropdoc.documentFile(fileData, function(doc){
          console.log("Rendered file saved");      
          res.send(doc);

        });
      });
      */
     res.send(datauri);
    } 
  });

  

};

exports.exportContactsToCSV = function (req, res) { 
  console.log("export csv");
  var json2csv = require('json2csv');

  var titles = [
       "Full_name", "First_name",  "Last_name",   "Title"  , "Company", "Email" , "Address" , "City" , "State"  , "Zip"  , "Phone"  , "Cell"  , "Claim_"  , "SS_"  , "DOB" , "DOI"  , "Injury", "Job_Title"  , "Company_Name" , "Contact_First_Name" , "Contact_Last_Name"  , "Gender_M_or_F"  , "Phone1"  , "fax1"  , "e-mail"  , "Address1"  , "City1" , "State1" , "Zip1"  , "Company_Name1"  , "First_Name1"  , "Last_Name1" , "Gender_M_or_F1" , "Phone2"  , "Fax2"  , "e-mail1"  , "Claims_Assistant"  , "Claims_Assistant_email"  , "Address2"  , "City2"  , "State2"  , "Zip2" , "First_Name2" , "Last_name2"  , "Dr_Type"  , "Firm" , "Street_address"  , "City3"  , "State3"  , "Zip3" , "Phone3"  , "Fax3"  , "Medical_Record_" , "First_Name3"  , "Last_Name3"  , "Gender_M_or_F2"  , "Firm1"  , "Address3" , "City4" , "State4"  , "Zip4"  , "Phone4" , "Fax4"  , "e-mail2"  , "First_Name4"  , "Last_Name4"  , "Gender_M_or_F3" , "Firm2" , "Street_address1"  , "City5" , "State5" , "Zip5" , "Phone5"  , "Fax5"  , "e-mail3"  , "Service_Requested"  , "Additional_Service_Request" , "Program" , "Date_of_referral" , "Date_assigned"  , "Date_of_Reopen"  , "Re-open_Service_Request"  , "Additional_Information"  , "Date_Cancelled"  , "Reason_for_cancellation"  , "North_or_Central_or_Statewide" , "Counselor_Assigned" , "Date_Closed"  , "Estimated_case_value"  , "test 1", "Contact_ID"  , "Language"  , "Adding_date" , "Adding_application" , "Adding_method"  , "Added_by"  , "Login_name"
  ];
  
  var entries = [];
  
  var Article = mongoose.model('Article');
  var query = Article.find();
  
  for(var i in fields){
    var populate = fields[i].key+".id";
    query.populate(populate);
  }
  
  if(req.params.limit){
    query.limit(req.params.limit);
  }
  
  Article.count(function(err, count){
    console.log("total: ", count);
    console.log("skip: ", (count / 5) * (req.params.part - 1));
    console.log("limit:", (count / 5));
    query.lean().sort('LastnameContact.value').skip((count / 5) * (req.params.part - 1)).limit((count / 5))
    .exec(function (err, article) {
      console.log(err);
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        //res.json(articles);

        for(var k in article){
          var full_name = article[k].FirstnameContact.value + " " +  article[k].LastnameContact.value;
          var set = {
          "Full_name" : full_name, 
          "First_name":article[k].FirstnameContact.value,
          "Last_name" : article[k].LastnameContact.value ,
          "Title" : article[k].JobTitleContact.value , 
          //"Company": article[k].CompanyContact.value,
          "Email" : article[k].EmailContact.value ,
          "Address" : article[k].AddressContact.value,
          "City" : article[k].CityContact.value ,
          "State" : article[k].StateContact.value ,
          "Zip" : article[k].ZipContact.value ,
          "Phone" : article[k].PhoneContact.value ,
          "Cell" : article[k].CellContact.value , 
          "Claim_" : article[k].ClaimContact.value ,
          "SS_" : article[k].SSContact.value ,
          "DOB" : article[k].DOBContact.value , 
          "DOI" : article[k].DOIContact.value , 
          "Injury" : article[k].InjuryContact.value, 
          "Job_Title" :  article[k].JobTitleContact.value ,
          //"Company_Name2" : article[k].CompanyContact.value ,
          "Contact_First_Name" : article[k].LastnameContact.value ,
          "Contact_Last_Name" : article[k].ContactLastNameEmployer.value , 
          "Gender_M_or_F" : article[k].GenderMorFEmployer.value ,
          "Phone1" : article[k].ContactFirstNameEmployer.value , 
          "fax1" : article[k].faxEmployer.value ,
          "e-mail" : article[k].emailEmployer.value ,
          "Address1" : article[k].AddressEmployer.value , 
          "City1" : article[k].CityEmployer.value , 
          "State1" : article[k].StateEmployer.value
          , "Zip1" : article[k].ZipEmployer.value ,
          "Company_Name1" : article[k].CompanyNameClaimsRepresentative.value ,
          "First_Name1" : article[k].FirstNameClaimsRepresentative.value , 
          "Last_Name1" : article[k].LastNameClaimsRepresentative.value ,
          "Gender_M_or_F1" : article[k].GenderMorFClaimsRepresentative.value ,
          "Phone2" : article[k].PhoneClaimsRepresentative.value , 
          "Fax2" : article[k].FaxClaimsRepresentative.value , 
          "e-mail1" : article[k].emailClaimsRepresentative.value , 
          "Claims_Assistant" : article[k].ClaimsAssistantClaimsRepresentative.value , 
          "Claims_Assistant_email" : article[k].ClaimsAssistantemailClaimsRepresentative.value ,
          "Address2" : article[k].AddressClaimsRepresentative.value , 
          "City2" : article[k].CityClaimsRepresentative.value , 
          "State2" : article[k].StateClaimsRepresentative.value , 
          "Zip2" : article[k].ZipClaimsRepresentative.value , 
          "First_Name2" : article[k].FirstNameClaimsRepresentative.value ,
          "Last_name2" : article[k].LastNameClaimsRepresentative.value , 
          "Dr_Type" : article[k].DrTypeTreatingPhysician.value , 
          "Firm" : article[k].FirmTreatingPhysician.value , 
          "Street_address" : article[k].StreetaddressTreatingPhysician.value , 
          "City3" : article[k].CityTreatingPhysician.value , 
          "State3" : article[k].StateTreatingPhysician.value , 
          "Zip3" : article[k].ZipTreatingPhysician.value ,
          "Phone3" : article[k].PhoneTreatingPhysician.value , 
          "Fax3" : article[k].FaxTreatingPhysician.value ,
          "Medical_Record_" : article[k].MedicalRecordTreatingPhysician.value , 
          "First_Name3" : article[k].FirstNameTreatingPhysician.value , 
          "Last_Name3" : article[k].LastnameTreatingPhysician.value , 
          "Gender_M_or_F2" : article[k].GenderMorFApplicantAtttorney.value , 
          "Firm1" : article[k].FirmApplicantAtttorney.value ,
          "Address3" : article[k].AddressApplicantAtttorney.value , 
          "City4" : article[k].CityApplicantAtttorney.value , 
          "State4" : article[k].StateApplicantAtttorney.value , 
          "Zip4" : article[k].ZipApplicantAtttorney.value ,
          "Phone4" : article[k].PhoneApplicantAtttorney.value , 
          "Fax4" : article[k].FaxApplicantAtttorney.value , 
          "e-mail2" : article[k].emailApplicantAtttorney.value , 
          "First_Name4" : article[k].FirstNameApplicantAtttorney.value , 
          "Last_Name4" : article[k].LastNameApplicantAtttorney.value , 
          "Gender_M_or_F3" : article[k].GenderDefenseAttorney.value , 
          "Firm2" : article[k].FirmDefenseAttorney.value , 
          "Street_address1" : article[k].StreetaddressDefenseAttorney.value , 
          "City5" : article[k].CityDefenseAttorney.value , 
          "State5" : article[k].StateDefenseAttorney.value , 
          "Zip5" : article[k].ZipDefenseAttorney.value , 
          "Phone5" : article[k].PhoneDefenseAttorney.value , 
          "Fax5" : article[k].FaxDefenseAttorney.value , 
          "e-mail3" : article[k].emailDefenseAttorney.value , 
          "Service_Requested" : article[k].ServiceRequestedServiceRequested.value ,
          "Additional_Service_Request" : article[k].LastnameContact.value , 
          "Program" : article[k].AdditionalServiceRequestServiceRequested.value ,
          "Date_of_referral" : article[k].DateofreferralFocusInformation.value , 
          //"Date_assigned" : article[k].CounselorAssignedFocusInformation.value ,
          "Date_of_Reopen" : article[k].DateofReopenFocusInformation.value , 
          "Re-open_Service_Request" : article[k].LastnameContact.value , 
          "Additional_Information" : article[k].LastnameContact.value , 
          "Date_Cancelled" : article[k].LastnameContact.value ,
          "Reason_for_cancellation" : article[k].ReasonforcancellationFocusInformation.value ,
          "North_or_Central_or_Statewide" : article[k].NorthorCentralorStatewideFocusInformation.value ,
          //"Counselor_Assigned" : article[k].CounselorAssignedFocusInformation.value ,
          "Date_Closed" : article[k].DateClosedFocusInformation.value ,
          "Estimated_case_value" : article[k].EstimatedcasevalueFocusInformation.value , 
          "test 1" : article[k].LastnameContact.value 
          , "Contact_ID" : article[k].LastnameContact.value 
          , "Language" : article[k].LastnameContact.value ,
          "Adding_date" : article[k].LastnameContact.value , 
          "Adding_application" : article[k].LastnameContact.value , 
          "Adding_method" : article[k].LastnameContact.value , 
          "Added_by" : article[k].LastnameContact.value , 
          "Login_name" : article[k].LastnameContact.value
        };
        if(article[k].StatusFocusInformation)
          set.Status = article[k].StatusFocusInformation.value;
          entries.push(set);
        }
        json2csv({ data: entries, fields: titles }, function(err, csv) {
          if (err) console.log(err);
          res.send(csv).end();
          var rand = randomstring.generate(3);
        });
      }
    });
  })

  //res.json("ok");
  
};

exports.CalculatorToCSV = function (req, res) { 

  var json2csv = require('json2csv');

  var titles = [
       "Full Name", "Claim","Date Assigned","Date Close", "RTW (trans)","TWA End", "RTW (reg/perm)", "TD Daily rate", "Days Saved", "Voucher", "Savings to Date", "Status"	
  ];
  
  var entries = [];
  
  var Article = mongoose.model('Article');
  var query = Article.find();
  var smartList = req.body;
  query.where('RTWtransFocusInformation.value').ne(new Date("1970-01-01T00:00:00.000+0000"));
  query.where('TWAEndFocusInformation.value').ne(new Date("1970-01-01T00:00:00.000+0000"));
    for(var k in smartList){
      var field = smartList[k].field;
      var value = smartList[k].text;
      if(smartList[k].endingDate)
        var end = new Date(smartList[k].endingDate);
      console.log("end: " + field);
      
      if(field === "closed"){
        if(value === "open"){
          query.where('DateClosedFocusInformation.value').lte(new Date(1970, 1, 2));
          query.where('DateClosedFocusInformation.value').equals("");
        }
        else if(value === "closed"){
          query.where('DateClosedFocusInformation.value').lte(new Date());
        }
      }
      
      var re = new RegExp(value, 'i');
      if(smartList[k].type === "text" || smartList[k].type === "dropdown"){
        if(smartList[k].option === "contains")
          query.where(field+'.value').equals(new RegExp(value,'i'));
        else if(smartList[k].option === "starting")
          query.where(field+'.value').equals(new RegExp("^"+value,"i"));
        else if(smartList[k].option === "not")
          query.where(field+'.value').ne(value);
        else if(smartList[k].option === "exact")
          query.where(field+'.value').equals(new RegExp("^"+value+"$","i"));
      } else if(smartList[k].type === "date"){
        //query.where(field).equals(value);
        if(smartList[k].option !== "range"){
        var date = new Date(value);
          date.setUTCHours(12,0,0,0);
        
          if(smartList[k].option === "earlier"){
            query.where(field+'.value').lt(date);
            query.where(field+'.value').ne(null);
            query.where(field+'.value').ne("");
            query.where(field+'.value').ne(" ");
          }
          else if(smartList[k].option === "exactly"){
            var d1 = new Date(value);
            var d2 = new Date(value);
            d2.setDate(d2.getDate()+1);
            query.where(field+'.value').gte(d1).lte(d2);
          }
          else if(smartList[k].option === "later"){
            query.where(field+'.value').gt(date);
          }
          else if(smartList[k].option === "no"){
            query.where(field+'.value').equals(null);
          }
        }
          else if(smartList[k].option === "range"){
          var start_date = new Date(value.startDate);
          start_date.setUTCHours(12,0,0,0);
          var end_date = new Date(value.endDate);
          end_date.setUTCHours(12,0,0,0);
          query.where(field+'.value').gt(start_date).lt(end_date);   
        }
      }
    }
    for(var i in fields){
      var populate = fields[i].key+".id";
      query.populate(populate);
    }
    
    if(req.user.roles.indexOf("admin") === -1){
      //query.where("user").equals(req.user._id);
      //query.where("permissions").equals(req.user._id);
      query.or([{ permissions: req.user._id }, { user: req.user._id }]);
    }
    
  for(var i in fields){
    var populate = fields[i].key+".id";
    query.populate(populate);
  }
  
  query.lean()
  //.skip(2)
  //.limit(100)
  .exec(function (err, article) {
    console.log("#### we found : " + article.length );
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      //res.json(articles);
 
      for(var k in article){
        var rate = 0;
        var rtwT = null, twaEND = null, dateassign = null, dailyRate = null, regperm = null, date2 = null, date1 = null, closeDate = null, status = null; 
        if(
            (article[k].RTWtransFocusInformation && article[k].TDDailyrateFocusInformation)  &&
            (article[k].RTWtransFocusInformation.value !== null && article[k].TDDailyrateFocusInformation.value !== null)
          ){
            if(article[k].TWAEndFocusInformation && article[k].TWAEndFocusInformation.value !== null){
                date1 = article[k].TWAEndFocusInformation.value;
              }
            else if(end){
              date1 = end;
            }
            else
            {
             // console.log(moment().subtract(1, 'months').endOf('month')._d);
              date1 = moment().subtract(1, 'months').endOf('month')._d;
              
            }
            date2 = article[k].RTWtransFocusInformation.value;
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            rate += diffDays * article[k].TDDailyrateFocusInformation.value;
            rtwT = moment(article[k].RTWtransFocusInformation.value).format('MM/DD/YYYY');
            twaEND =  moment(date1).format('MM/DD/YYYY');
            dailyRate = article[k].TDDailyrateFocusInformation.value;
        }
        if(article[k].DateassignedFocusInformation){
          dateassign = moment(article[k].DateassignedFocusInformation.value).format('MM/DD/YYYY');
        }
        if(article[k].DateClosedFocusInformation){
          closeDate = moment(article[k].DateClosedFocusInformation.value).format('MM/DD/YYYY');
        }
        
        

        var voucher = 0;
        var full_name = article[k].FirstnameContact.value + " " +  article[k].LastnameContact.value;
        if(article[k].StatusFocusInformation)
          status = article[k].StatusFocusInformation.value;
        else
          status = "";
        if(article[k].RTWregpermFocusInformation && article[k].RTWregpermFocusInformation.value !== null){
          rate +=6000;
          voucher = 6000;
          regperm = moment(article[k].RTWregpermFocusInformation.value).format('MM/DD/YYYY');
        }
        if(rate <=0)
          continue;
        var set = {
        "Full Name" : full_name,
        "Claim" : article[k].ClaimContact.value,
        "Date Assigned" : dateassign,
        "Date Close" : closeDate,
        "RTW (trans)" : rtwT,
        "TWA End" : twaEND,
        "RTW (reg/perm)": regperm,
        "TD Daily rate" : dailyRate,
        "Days Saved" : diffDays,
        "Voucher" : "$"+voucher,
        "Savings to Date" : "$"+rate,
        "Status": status
      };
        entries.push(set);
      }
      json2csv({ data: entries, fields: titles }, function(err, csv) {
        if (err) console.log(err);
        res.send(csv).end();
        var rand = randomstring.generate(3);
      });
    }
    
  });


  //res.json("ok");
  
};

exports.list = function (req, res) {
  var query = EmailHistory.find();
  if(req.user.roles !== 'admin')
    query.where("user").equals(req.user._id);
  query.populate('user','displayName lastName firstName email').exec(function (err, emails) {
    if (err) {
      console.log(err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(emails);
    } 
  });
        
  };
  
exports.findDoplicates = function (req, res) {
  var dup = {};
  var Article = mongoose.model('Article');
  var query = Article.find();
  query.lean()
  .skip(req.params.start)
  .limit(req.params.end)
  .exec(function (err, articles) {
    for(var k in articles){
      var first = articles[k].FirstnameContact.value;
      var last = articles[k].LastnameContact.value;
      if(!dup.hasOwnProperty(first))
        dup[first] = {};
      if(!dup[first].hasOwnProperty(last))
        dup[first][last] = [];
      
      dup[first][last].push(articles[k]);
    }
    
    for(var k in dup){
        for(var i in dup[k])
          for(var j in dup[k][i]){
            if(Object.keys(dup[k][i]).length > 1){
              //console.log(dup[k][i][j].FirstnameContact.value + "  " + dup[k][i][j].LastnameContact.value);
            }
            else{
              delete dup[k][i];
            }
        }
      if(Object.keys(dup[k]).length < 2)
        delete dup[k];
    }
    res.json(dup);
  });
        
  };

function documentEmail(em){
    var email = new EmailHistory(em);

    email.save(function (err) { 
    if (err) {
      console.log("email documented failed");
    } else {
     console.log("email documented succeeded");
    }
  });
}

exports.deleteEmail = function (req, res) {
  console.log(req.params.id);
  EmailHistory.find({ _id: req.params.id }).remove().exec(function(err, doc){
    console.log(err);
    if (err) {
      console.log(err);
      res.send("fail");
    }
    else {
      res.send("ok");
    }
});
        
};

exports.exportContactsToCSVCustom = function (req, res) {
    var Article = mongoose.model('Article');
    var query = Article.find();
    var smartList = req.body;
    var json2csv = require('json2csv');
    var titles = [
         "Full_name", "First_name",  "Last_name",   "Title"  , "Company", "Email" , "Address" , "City" , "State"  , "Zip"  , "Phone"  , "Cell"  , "Claim_"  , "SS_"  , "DOB" , "DOI"  , "Injury", "Job_Title"  , "Company_Name" , "Contact_First_Name" , "Contact_Last_Name"  , "Gender_M_or_F"  , "Phone1"  , "fax1"  , "e-mail"  , "Address1"  , "City1" , "State1" , "Zip1"  , "Company_Name1"  , "First_Name1"  , "Last_Name1" , "Gender_M_or_F1" , "Phone2"  , "Fax2"  , "e-mail1"  , "Claims_Assistant"  , "Claims_Assistant_email"  , "Address2"  , "City2"  , "State2"  , "Zip2" , "First_Name2" , "Last_name2"  , "Dr_Type"  , "Firm" , "Street_address"  , "City3"  , "State3"  , "Zip3" , "Phone3"  , "Fax3"  , "Medical_Record_" , "First_Name3"  , "Last_Name3"  , "Gender_M_or_F2"  , "Firm1"  , "Address3" , "City4" , "State4"  , "Zip4"  , "Phone4" , "Fax4"  , "e-mail2"  , "First_Name4"  , "Last_Name4"  , "Gender_M_or_F3" , "Firm2" , "Street_address1"  , "City5" , "State5" , "Zip5" , "Phone5"  , "Fax5"  , "e-mail3"  , "Service_Requested"  , "Additional_Service_Request" , "Program" , "Date_of_referral" , "Date_assigned"  , "Date_of_Reopen"  , "Re-open_Service_Request"  , "Additional_Information"  , "Date_Cancelled"  , "Reason_for_cancellation"  , "North_or_Central_or_Statewide" , "Counselor_Assigned" , "Date_Closed"  , "Estimated_case_value"  , "test 1", "Contact_ID"  , "Language"  , "Adding_date" , "Adding_application" , "Adding_method"  , "Added_by"  , "Login_name"
    ];
    var entries = [];
    
  
    for(var k in smartList){
      var field = smartList[k].field;
      var value = smartList[k].text;
      if(field === "closed"){
        console.log(smartList[k]);
        if(value === "open"){
          query.where('DateClosedFocusInformation.value').lte(new Date(1970, 1, 2));
          query.where('DateClosedFocusInformation.value').equals("");
        }
        else if(value === "closed"){
          query.where('DateClosedFocusInformation.value').lte(new Date());
        }
        continue;
      }
      
      var re = new RegExp(value, 'i');
      if(smartList[k].type === "text"){
        if(smartList[k].option === "contains")
          query.where(field+'.value').equals(new RegExp(value,'i'));
        else if(smartList[k].option === "starting")
          query.where(field+'.value').equals(new RegExp("^"+value,"i"));
        else if(smartList[k].option === "not")
          query.where(field+'.value').ne(value);
        else if(smartList[k].option === "exact")
          query.where(field+'.value').equals(new RegExp("^"+value+"$","i"));
      } else if(smartList[k].type === "date"){
        //query.where(field).equals(value);
        if(smartList[k].option !== "range"){
        var date = new Date(value);
          date.setUTCHours(12,0,0,0);
        
          if(smartList[k].option === "earlier"){
            query.where(field+'.value').lt(date);
            query.where(field+'.value').ne(null);
            query.where(field+'.value').ne("");
            query.where(field+'.value').ne(" ");
          }
          else if(smartList[k].option === "exactly"){
            var d1 = new Date(value);
            var d2 = new Date(value);
            d2.setDate(d2.getDate()+1);
            console.log(d1,d2);
            query.where(field+'.value').gte(d1).lte(d2);
          }
          else if(smartList[k].option === "later"){
            query.where(field+'.value').gt(date);
          }
        }
          else if(smartList[k].option === "range"){
          var start_date = new Date(value.startDate);
          start_date.setUTCHours(12,0,0,0);
          var end_date = new Date(value.endDate);
          end_date.setUTCHours(12,0,0,0);
          console.log(end_date , " " , start_date);
          query.where(field+'.value').gt(start_date).lt(end_date);   
        }
      }
    }
    for(var i in fields){
      var populate = fields[i].key+".id";
      query.populate(populate);
    }
    
    if(req.user.roles.indexOf("admin") === -1){
      //query.where("user").equals(req.user._id);
      //query.where("permissions").equals(req.user._id);
      query.or([{ permissions: req.user._id }, { user: req.user._id }]);
    }
    
    query.sort('LastnameContact.value')
         .lean()
         //.limit(1000)
         .exec(function (err, article) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      //console.log(articles);
      for(var k in article){
        var full_name = article[k].FirstnameContact.value + " " +  article[k].LastnameContact.value;
        var set = {
        "Full_name" : full_name, 
        "First_name":article[k].FirstnameContact.value,
        "Last_name" : article[k].LastnameContact.value ,
        "Title" : article[k].JobTitleContact.value , 
        //"Company": article[k].CompanyContact.value,
        "Email" : article[k].EmailContact.value ,
        "Address" : article[k].AddressContact.value,
        "City" : article[k].CityContact.value ,
        "State" : article[k].StateContact.value ,
        "Zip" : article[k].ZipContact.value ,
        "Phone" : article[k].PhoneContact.value ,
        "Cell" : article[k].CellContact.value , 
        "Claim_" : article[k].ClaimContact.value ,
        "SS_" : article[k].SSContact.value ,
        "DOB" : article[k].DOBContact.value , 
        "DOI" : article[k].DOIContact.value , 
        "Injury" : article[k].InjuryContact.value, 
        "Job_Title" :  article[k].JobTitleContact.value ,
        //"Company_Name2" : article[k].CompanyContact.value ,
        "Contact_First_Name" : article[k].LastnameContact.value ,
        "Contact_Last_Name" : article[k].ContactLastNameEmployer.value , 
        "Gender_M_or_F" : article[k].GenderMorFEmployer.value ,
        "Phone1" : article[k].ContactFirstNameEmployer.value , 
        "fax1" : article[k].faxEmployer.value ,
        "e-mail" : article[k].emailEmployer.value ,
        "Address1" : article[k].AddressEmployer.value , 
        "City1" : article[k].CityEmployer.value , 
        "State1" : article[k].StateEmployer.value
        , "Zip1" : article[k].ZipEmployer.value ,
        "Company_Name1" : article[k].CompanyNameClaimsRepresentative.value ,
        "First_Name1" : article[k].FirstNameClaimsRepresentative.value , 
        "Last_Name1" : article[k].LastNameClaimsRepresentative.value ,
        "Gender_M_or_F1" : article[k].GenderMorFClaimsRepresentative.value ,
        "Phone2" : article[k].PhoneClaimsRepresentative.value , 
        "Fax2" : article[k].FaxClaimsRepresentative.value , 
        "e-mail1" : article[k].emailClaimsRepresentative.value , 
        "Claims_Assistant" : article[k].ClaimsAssistantClaimsRepresentative.value , 
        "Claims_Assistant_email" : article[k].ClaimsAssistantemailClaimsRepresentative.value ,
        "Address2" : article[k].AddressClaimsRepresentative.value , 
        "City2" : article[k].CityClaimsRepresentative.value , 
        "State2" : article[k].StateClaimsRepresentative.value , 
        "Zip2" : article[k].ZipClaimsRepresentative.value , 
        "First_Name2" : article[k].FirstNameClaimsRepresentative.value ,
        "Last_name2" : article[k].LastNameClaimsRepresentative.value , 
        "Dr_Type" : article[k].DrTypeTreatingPhysician.value , 
        "Firm" : article[k].FirmTreatingPhysician.value , 
        "Street_address" : article[k].StreetaddressTreatingPhysician.value , 
        "City3" : article[k].CityTreatingPhysician.value , 
        "State3" : article[k].StateTreatingPhysician.value , 
        "Zip3" : article[k].ZipTreatingPhysician.value ,
        "Phone3" : article[k].PhoneTreatingPhysician.value , 
        "Fax3" : article[k].FaxTreatingPhysician.value ,
        "Medical_Record_" : article[k].MedicalRecordTreatingPhysician.value , 
        "First_Name3" : article[k].FirstNameTreatingPhysician.value , 
        "Last_Name3" : article[k].LastnameTreatingPhysician.value , 
        "Gender_M_or_F2" : article[k].GenderMorFApplicantAtttorney.value , 
        "Firm1" : article[k].FirmApplicantAtttorney.value ,
        "Address3" : article[k].AddressApplicantAtttorney.value , 
        "City4" : article[k].CityApplicantAtttorney.value , 
        "State4" : article[k].StateApplicantAtttorney.value , 
        "Zip4" : article[k].ZipApplicantAtttorney.value ,
        "Phone4" : article[k].PhoneApplicantAtttorney.value , 
        "Fax4" : article[k].FaxApplicantAtttorney.value , 
        "e-mail2" : article[k].emailApplicantAtttorney.value , 
        "First_Name4" : article[k].FirstNameApplicantAtttorney.value , 
        "Last_Name4" : article[k].LastNameApplicantAtttorney.value , 
        "Gender_M_or_F3" : article[k].GenderDefenseAttorney.value , 
        "Firm2" : article[k].FirmDefenseAttorney.value , 
        "Street_address1" : article[k].StreetaddressDefenseAttorney.value , 
        "City5" : article[k].CityDefenseAttorney.value , 
        "State5" : article[k].StateDefenseAttorney.value , 
        "Zip5" : article[k].ZipDefenseAttorney.value , 
        "Phone5" : article[k].PhoneDefenseAttorney.value , 
        "Fax5" : article[k].FaxDefenseAttorney.value , 
        "e-mail3" : article[k].emailDefenseAttorney.value , 
        "Service_Requested" : article[k].ServiceRequestedServiceRequested.value ,
        "Additional_Service_Request" : article[k].LastnameContact.value , 
        "Program" : article[k].AdditionalServiceRequestServiceRequested.value ,
        "Date_of_referral" : article[k].DateofreferralFocusInformation.value , 
        //"Date_assigned" : article[k].CounselorAssignedFocusInformation.value ,
        "Date_of_Reopen" : article[k].DateofReopenFocusInformation.value , 
        "Re-open_Service_Request" : article[k].LastnameContact.value , 
        "Additional_Information" : article[k].LastnameContact.value , 
        "Date_Cancelled" : article[k].LastnameContact.value ,
        "Reason_for_cancellation" : article[k].ReasonforcancellationFocusInformation.value ,
        "North_or_Central_or_Statewide" : article[k].NorthorCentralorStatewideFocusInformation.value ,
        //"Counselor_Assigned" : article[k].CounselorAssignedFocusInformation.value ,
        "Date_Closed" : article[k].DateClosedFocusInformation.value ,
        "Estimated_case_value" : article[k].EstimatedcasevalueFocusInformation.value , 
        "test 1" : article[k].LastnameContact.value 
        , "Contact_ID" : article[k].LastnameContact.value 
        , "Language" : article[k].LastnameContact.value ,
        "Adding_date" : article[k].LastnameContact.value , 
        "Adding_application" : article[k].LastnameContact.value , 
        "Adding_method" : article[k].LastnameContact.value , 
        "Added_by" : article[k].LastnameContact.value , 
        "Login_name" : article[k].LastnameContact.value,
        
      };
      if(article[k].StatusFocusInformation)
        set.Status = article[k].StatusFocusInformation.value; 
       entries.push(set);
      }
      json2csv({ data: entries, fields: titles }, function(err, csv) {
        if (err) console.log(err);
        res.send(csv).end();
        var rand = randomstring.generate(3);
      });
    } 
   });
   
  };
