import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { PrismaClient,Prisma } from "@prisma/client";
import { verifyHashPassword } from "../services/verifyHashPassword";
import {Strategy as GoogleStrategy} from "passport-google-oauth20"
import { generateProfileImg } from "../services/generateProfileImg";
const prisma = new PrismaClient()

passport.use(
  new LocalStrategy({usernameField: "email", passwordField: "password"},async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email },
      });
      if (!user) {
        return done(null, false, { message: "User not found" });
      }
      const verifiedPassword = await verifyHashPassword(
        password,
        user.password
      );
      if (!verifiedPassword) {
        return done(null, false, { message: "Password doesn't match" });
      }

      done(null,{
        id: user.id,
        email: user.email,
        username:user.username,
        profileImg:user.profileImg,
        createdAt:user.createdAt,
      })
    } catch (error) {
      if (error instanceof Error) {
        return done(error);
      }
      return done(error);
    }
  })
);

passport.use(new GoogleStrategy({
    clientID : process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    callbackURL: "http://localhost:8000/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    try{
      const email = profile.emails?.[0]?.value
      if(!email){
        throw new Error("Google Provider didn't return any email")
      } 
      const user = await prisma.user.findUnique({
      where:{
        email
      }
    })
    if (!user) {
      const avatarURL = generateProfileImg(profile.displayName);
      const user = await prisma.user.create({
        data: {
          username: profile.displayName,
          email: email || "",
          password: "",
          profileImg: avatarURL,
          wallet:{
            create:{
              balance:0
            }
          }
        },
        include:{wallet:true}
      });
      return done(null, {
        id: user.id,
        email: user.email,
        username: user.username,
        profileImg: user.profileImg,
        createdAt: user.createdAt,
      });
    } else {
      return done(null, {
        id: user.id,
        email: user.email,
        username: user.username,
        profileImg: user.profileImg,
        createdAt: user.createdAt,
      });
    }
    }catch(err){
      return done(err)
    }
    
  }
));
passport.serializeUser((user: any,done)=>{
    done(null,user.id)
})

passport.deserializeUser(async(id: string,done)=>{
    try{
        const user = await prisma.user.findUnique({
        where: { id: id },
        });
        if(!user) throw new Error("User not Found")
        done(null,{
        id: user.id,
        email: user.email,
        username:user.username,
        profileImg:user.profileImg,
        createdAt:user.createdAt,
      })
    }catch(error){
        done(error,null)
    }

})