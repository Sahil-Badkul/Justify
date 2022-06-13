const mongoose = require('mongoose')

// mongoose.connect("mongodb://localhost:27017/userDBApForm",{
//     useNewUrlParser:true,
//     useUnifiedTopology:true
// })

var applicationFormSchema = new mongoose.Schema({
    applicant : String,
    fathername : String,
    email : String,
    dob : String,
    casteid : String,
    category : String,
    castefile : String,
    incomeid : Number,
    issuedate : String,
    amount : Number,
    issue_by : String,
    incomefile : String,
    domicileid : Number,
    dateofissued : String,
    state : String,
    address : String,
    autherizedby : String,
    domicilefile : String
});

const ApplicationFormModel = mongoose.model("ApplicationFormDB", applicationFormSchema);

module.exports = ApplicationFormModel