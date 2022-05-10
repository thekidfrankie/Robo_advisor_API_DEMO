import { User } from "../models/User.model.js";
import { RefreshToken } from "../models/RefreshToken.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { configs } from "../database/config/configForNode.js";

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ where: { email: email } });
    if (!existingUser) {
      return res.status(404).json({ message: "user dont exist." });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credetnials" });
    }
    const token = jwt.sign(
      { id: existingUser.userId },
      configs.jwt.secret,
      {
        expiresIn: configs.jwt.jwtExpiration
      }
      );
      let refreshToken = await RefreshToken.createToken(existingUser);
      console.log(configs.jwt.jwtExpiration);
    res
      .status(200)
      .json({
        auth: true,
        result: existingUser,
        token: token,
        refreshToken: refreshToken,
      });
  } catch (error) {
    res.status(500).json({ message: "ups something whent wrong" });
  }
};

  export const createUser = async (req, res) => {
    try {
      const { firstName, lastName, email, password, passwordConfirm } = req.body;
  
      const existingUser = await User.findOne({ where: { email: email } });
      if (existingUser) {
        return res.status(411).json({ message: "the user email is alredy used" });
      }
      if (password !== passwordConfirm) {
        return res
          .status(410)
          .json({ message: "the two passwords of the user dont match" });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      let newUser = await User.create(
        {
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: hashedPassword,
        },
        {
          fields: ["firstName", "lastName", "email", "password"],
        }
      );
      res.json(newUser);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

  export const refreshToken = async (req, res)  => {
    const { refreshToken: requestToken } = req.body;
    if (requestToken == null) {
      return res.status(403).json({ message: "Refresh Token is required!" });
    }
    try {
      let refreshToken = await RefreshToken.findOne({ where: { token: requestToken } });
      console.log(refreshToken)
      if (!refreshToken) {
        res.status(403).json({ 
          auth: 4,
          message: "Refresh token is not in database!" });
        return;
      }
      if (RefreshToken.verifyExpiration(refreshToken)) {
        RefreshToken.destroy({ where: { id: refreshToken.id } });
        
        res.status(403).json({
          auth: 3,
          message: "Refresh token was expired. Please make a new signin request",
        });
        return;
      }
      const user = await refreshToken.getUser();
      let newAccessToken = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: configs.jwt.jwtExpiration,
      });
      return res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: refreshToken.token,
      });
    } catch (err) {
      return res.status(500).send({ message: err });
    }
  };