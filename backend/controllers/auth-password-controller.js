const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Admin = require("../models/adminSchema");
const Teacher = require("../models/teacherSchema");
const V2User = require("../models/v2/User");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
    return EMAIL_REGEX.test(normalizeEmail(email));
}

function isStrongPassword(password) {
    return STRONG_PASSWORD_REGEX.test(String(password || ""));
}

function getResetTokenExpiryMinutes() {
    const parsedValue = Number(process.env.RESET_TOKEN_EXPIRY_MINUTES || 15);
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
        return 15;
    }
    return parsedValue;
}

function shouldExposeResetToken() {
    return process.env.NODE_ENV !== "production" || process.env.EXPOSE_RESET_TOKEN === "true";
}

function hashResetToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

function getFrontendBaseUrl() {
    const fallback = "http://localhost:3000";
    return (process.env.FRONTEND_URL || fallback).replace(/\/+$/, "");
}

function buildResetLink(email, token) {
    const encodedEmail = encodeURIComponent(email);
    const encodedToken = encodeURIComponent(token);
    return `${getFrontendBaseUrl()}/reset-password?email=${encodedEmail}&token=${encodedToken}`;
}

async function findAccountByEmail(email) {
    const normalizedEmail = normalizeEmail(email);

    const [v2User, admin, teacher] = await Promise.all([
        V2User.findOne({ email: normalizedEmail }),
        Admin.findOne({ email: normalizedEmail }),
        Teacher.findOne({ email: normalizedEmail }),
    ]);

    const matches = [
        v2User ? { modelType: "v2User", record: v2User } : null,
        admin ? { modelType: "admin", record: admin } : null,
        teacher ? { modelType: "teacher", record: teacher } : null,
    ].filter(Boolean);

    if (matches.length === 0) {
        return null;
    }

    if (matches.length > 1) {
        return { conflict: true };
    }

    return matches[0];
}

function setHashedPassword(account, hashedPassword) {
    if (account.modelType === "v2User") {
        account.record.passwordHash = hashedPassword;
        return;
    }

    account.record.password = hashedPassword;
}

function setResetToken(account, tokenHash, expiresAt) {
    account.record.resetPasswordToken = tokenHash;
    account.record.resetPasswordExpires = expiresAt;
}

function clearResetToken(account) {
    account.record.resetPasswordToken = undefined;
    account.record.resetPasswordExpires = undefined;
}

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body || {};

        if (!email) {
            return res.status(400).json({ success: false, message: "email is required" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        const normalizedEmail = normalizeEmail(email);
        const account = await findAccountByEmail(normalizedEmail);

        if (!account) {
            return res.status(404).json({ success: false, message: "Email not found" });
        }

        if (account.conflict) {
            return res.status(409).json({
                success: false,
                message: "Email is linked to multiple accounts. Contact support.",
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = hashResetToken(resetToken);
        const expiryMinutes = getResetTokenExpiryMinutes();
        const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

        setResetToken(account, tokenHash, expiresAt);
        await account.record.save();

        const responseData = {
            email: normalizedEmail,
            expiresInMinutes: expiryMinutes,
        };

        if (shouldExposeResetToken()) {
            responseData.resetToken = resetToken;
            responseData.resetLink = buildResetLink(normalizedEmail, resetToken);
        }

        return res.status(200).json({
            success: true,
            message: "Password reset request accepted",
            data: responseData,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to process forgot password request",
            error: error.message,
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, newPassword, token } = req.body || {};

        if (!email || !newPassword) {
            return res.status(400).json({ success: false, message: "email and newPassword are required" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }

        if (!isStrongPassword(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
            });
        }

        const normalizedEmail = normalizeEmail(email);
        const account = await findAccountByEmail(normalizedEmail);

        if (!account) {
            return res.status(404).json({ success: false, message: "Email not found" });
        }

        if (account.conflict) {
            return res.status(409).json({
                success: false,
                message: "Email is linked to multiple accounts. Contact support.",
            });
        }

        const hasStoredToken = Boolean(account.record.resetPasswordToken);
        const mustValidateToken = process.env.REQUIRE_RESET_TOKEN === "true" || hasStoredToken;

        if (mustValidateToken) {
            if (!token) {
                return res.status(400).json({ success: false, message: "Reset token is required" });
            }

            const tokenHash = hashResetToken(token);
            const isTokenMatch = account.record.resetPasswordToken === tokenHash;
            const isTokenExpired =
                !account.record.resetPasswordExpires ||
                new Date(account.record.resetPasswordExpires).getTime() < Date.now();

            if (!isTokenMatch || isTokenExpired) {
                return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
            }
        }

        const hashedPassword = await bcrypt.hash(String(newPassword), 10);
        setHashedPassword(account, hashedPassword);
        clearResetToken(account);
        await account.record.save();

        return res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to reset password",
            error: error.message,
        });
    }
};

module.exports = {
    forgotPassword,
    resetPassword,
};
