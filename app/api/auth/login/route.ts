import { pbkdf2Sync } from "crypto";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/database/mongodb";
import { HttpStatusCode } from "axios";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";
const SECRET_KEY = process.env.JWT_SECRET_KEY;
const TOKEN_EXPIRY = "100h";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("Users");
    const collection = db.collection("accounts");
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: HttpStatusCode.BadRequest },
      );
    }

    const user = await collection.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: HttpStatusCode.Unauthorized },
      );
    }

    const [salt, storedHash] = user.password.split(":");
    const hashedPassword = pbkdf2Sync(
      password,
      salt,
      ITERATIONS,
      KEY_LENGTH,
      DIGEST,
    ).toString("hex");

    if (hashedPassword !== storedHash) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: HttpStatusCode.Unauthorized },
      );
    }

    const token = jwt.sign({ email: user.email, id: user._id }, SECRET_KEY, {
      expiresIn: TOKEN_EXPIRY,
    });

    cookies().set({
      name: "session-token",
      value: token,
      httpOnly: true,
      maxAge: 60 * 60,
      path: "/",
    });

    return NextResponse.json(
      { success: true, message: "Login successful.", token },
      { status: HttpStatusCode.Ok },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Error logging in." },
      { status: HttpStatusCode.InternalServerError },
    );
  }
}
