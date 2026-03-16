import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Usuario from '../models/Usuario';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: '/'
};

/**
 * POST /auth/login
 * Verifica credenciales y, si son correctas, genera y devuelve el JWT.
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    try {
        // Buscar usuario por email
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Comparar contraseña
        const isMatch = await bcrypt.compare(password, usuario.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        const accessToken = generateAccessToken(
            String(usuario._id),
            usuario.name,
            usuario.email,
            usuario.organizacion as mongoose.Types.ObjectId
        );
        const refreshToken = generateRefreshToken(
            String(usuario._id),
            usuario.name,
            usuario.email,
            usuario.organizacion as mongoose.Types.ObjectId
        );

        res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

        return res.status(200).json({
            message: 'Login exitoso',
            accessToken,
            usuario: {
                _id: usuario._id,
                name: usuario.name,
                email: usuario.email,
                organizacion: usuario.organizacion
            }
        });
    } catch (error) {
        return res.status(500).json({ error });
    }
};

/**
 * POST /auth/refresh
 * Verifica el refresh token y entrega un nuevo access token.
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const incomingRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({ message: 'Refresh token requerido' });
        }

        const payload = verifyRefreshToken(incomingRefreshToken);
        const usuario = await Usuario.findById(payload.sub);

        if (!usuario) {
            return res.status(401).json({ message: 'Refresh token inválido' });
        }

        const newAccessToken = generateAccessToken(
            String(usuario._id),
            usuario.name,
            usuario.email,
            usuario.organizacion as mongoose.Types.ObjectId
        );
        const newRefreshToken = generateRefreshToken(
            String(usuario._id),
            usuario.name,
            usuario.email,
            usuario.organizacion as mongoose.Types.ObjectId
        );

        res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, refreshCookieOptions);

        return res.status(200).json({
            message: 'Token refrescado',
            accessToken: newAccessToken
        });
    } catch (error) {
        return res.status(401).json({ message: 'Refresh token expirado o inválido' });
    }
};

/**
 * POST /auth/logout
 * Revoca refresh token activo y elimina cookie.
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const incomingRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

        if (incomingRefreshToken) {
            try {
                // En esta versión sin persistencia, solo borramos la cookie.
                // No hay rastro que limpiar en la BD.
            } catch (error) {
                // noop
            }
        }

        res.clearCookie(REFRESH_COOKIE_NAME, {
            ...refreshCookieOptions,
            maxAge: undefined
        });

        return res.status(200).json({ message: 'Logout exitoso' });
    } catch (error) {
        return res.status(500).json({ error });
    }
};
