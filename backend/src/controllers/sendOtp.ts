import nodemailer from "nodemailer";
import 'dotenv/config'
export const sendOtp = (toEmail,otp)=>{
    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASSWORD
        }
    })
    
    const mailOptions = {
        from:process.env.EMAIL_USER,
        to:toEmail,
        subject:"Team Suchale | Verify Your Mail Important",
        text:`OTP to verify your account : ${otp}`
    }
    
    transporter.sendMail(mailOptions,(error,info)=>{
        if(error) console.log(error);
        else console.log(`Email sent to: ${toEmail}`);
    })
}

export default sendOtp;