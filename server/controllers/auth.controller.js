import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {  
    try {
        
        const {fullName, username, email, password} = req.body;

        // cek format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: "Format email salah"
            });
        }

        // cek username
        const existingUser = await User.findOne({username});
        if (existingUser) {
            return res.status(400).json({
                error: "Username sudah pernah didaftarkan"
            })
        }

        // cek email
        const existingEmail = await User.findOne({email});
        if (existingEmail) {
            return res.status(400).json({
                error: "Email sudah pernah didaftarkan"
            })
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: "Password harus terisi minimal 6 karakter"
            })
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // daftar user baru
        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedPassword
        })

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res)
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
            })
        } else {
            res.status(400).json({
                error: "User tidak ditemukan"
            })
        }
    } catch (error) {
        console.log("Error", error.message);         
        res.status(500).json({
            error: "Server tidak ditemukan"
        })
    }
}

export const login = async (req, res) => {
    try {
        
        const {username, password} = req.body;
        const user = await User.findOne({username});
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "")

        if (!user || !isPasswordCorrect) {
            res.status(400).json({
                error: "Username dan Password salah!"
            })
        }

        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
        })

    } catch (error) {
        console.log("Error", error.message);         
        res.status(500).json({
            error: "Server tidak ditemukan"
        })
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({
            message: "User berhasil keluar"
        });
    } catch (error) {
        console.log("Error", error.message);         
        res.status(500).json({
            error: "Server tidak ditemukan"
        }) 
    }
}

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    } catch (error) {
        console.log("Error", error.message);         
        res.status(500).json({
            error: "Server tidak ditemukan"
        }) 
    }
}