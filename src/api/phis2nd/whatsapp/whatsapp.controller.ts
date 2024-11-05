import { Router, Request, Response, NextFunction } from "express";
import {
    body,
    header,
    param,
    query,
    validationResult,
} from "express-validator";
import * as dotenv from "dotenv";
import crypto from "crypto";
import { confirmWhatsappService } from "./whatsapp.service";
import path from "path";
import fs from "fs";
import moment = require("moment-timezone");

dotenv.config();
export const router = Router();

router.get(
    "/confirm/",
    [query(["data"]).notEmpty()],
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.status(201).send({
                response: errors.array(),
                metadata: {
                    code: 400,
                    message: "Validation error",
                },
            });
            return;
        }

        const encryptedData = req.query.data as string;
        const key: string | undefined = process.env.keyKonfirmasiWa;

        try {
            const [encrypted, iv] = Buffer.from(
                decodeURIComponent(encryptedData),
                "base64"
            )
                .toString()
                .split("::")
                .map((part) => Buffer.from(part, "base64"));

            const decipher = crypto.createDecipheriv(
                "aes-256-cbc",
                key ? Buffer.from(key) : Buffer.from(""),
                iv
            );
            let decrypted = decipher.update(encrypted);
            decrypted = Buffer.concat([decrypted, decipher.final()]);

            const registrasiUrutId = parseInt(decrypted.toString(), 10);
            const resultConfirm = await confirmWhatsappService(
                registrasiUrutId
            );
            let htmlIndex = "";

            if (resultConfirm.code === 200) {
                htmlIndex = `
                    <!DOCTYPE html>
                        <html lang="en">

                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Konfirmasi Berhasil</title>
                            <style>
                                * {
                                    margin: 0;
                                    box-sizing: border-box;
                                }

                                body {
                                    font-family: Arial, sans-serif;
                                    background-color: #f0f0f0;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    height: 100vh;
                                }

                                .container {
                                    text-align: center;
                                    background-color: #ffffff;
                                    padding: 50px;
                                    border-radius: 10px;
                                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                }

                                .message-box {
                                    border: 3px solid #28a745;
                                    padding: 20px;
                                    border-radius: 5px;
                                }   

                                h1 {
                                    color: #28a745;
                                    font-size: 2.5rem;
                                    margin-bottom: 20px;
                                }

                                p {
                                    font-size: 1.2rem;
                                    color: #333333;
                                }

                                hr {
                                    margin: 20px 0;
                                }

                                h2 {
                                    margin-bottom: 10px;
                                    color: #333333;
                                }

                                strong {
                                    color: #000000;
                                }
                            </style>
                        </head>

                        <body>
                            <div class="container">
                                <div class="message-box">
                                    <h1>Selamat!</h1>
                                    <p>Konfirmasi WhatsApp Anda berhasil.</p>
                                    <hr>
                                    <h2>Detail Kunjungan</h2>
                                    <table border="1" width="100%" cellspacing="4" cellpadding="4" style="border-collapse: collapse; text-align: left">
                                        <tr>
                                            <td>
                                                <strong>Nama Pasien</strong>
                                            </td>
                                            <td>
                                                <strong>${
                                                    resultConfirm.data
                                                        .nama_pasien
                                                }</strong>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Dokter</strong>
                                            </td>
                                            <td>
                                                <strong>${resultConfirm?.data?.nama_pegawai ? resultConfirm.data.nama_pegawai : ''}</strong>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Klinik</strong>
                                            </td>
                                            <td>
                                                <strong>${
                                                    resultConfirm.data
                                                        .nama_bagian
                                                }</strong>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Tanggal Kunjungan</strong>
                                            </td>
                                            <td>
                                                <strong>${moment(
                                                    resultConfirm.data.tgl_masuk
                                                ).format("DD-MM-YYYY")}</strong>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </body>

                        </html>
                        `;
                fs.writeFileSync(
                    path.join(__dirname, "./../../../views/whatsappconfirm.html"),
                    htmlIndex
                );
                res.sendFile(
                    path.join(__dirname, "./../../../views", "whatsappconfirm.html")
                );
            } else {
                htmlIndex = `
                    <!DOCTYPE html>
                        <html lang="en">

                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Konfirmasi Berhasil</title>
                            <style>
                                * {
                                    margin: 0;
                                    box-sizing: border-box;
                                }

                                body {
                                    font-family: Arial, sans-serif;
                                    background-color: #f0f0f0;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    height: 100vh;
                                }

                                .container {
                                    text-align: center;
                                    background-color: #ffffff;
                                    padding: 50px;
                                    border-radius: 10px;
                                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                }

                                .message-box {
                                    border: 3px solid #B10F2E;
                                    padding: 20px;
                                    border-radius: 5px;
                                }   

                                h1 {
                                    color: #B10F2E;
                                    font-size: 2.5rem;
                                    margin-bottom: 20px;
                                }

                                p {
                                    font-size: 1.2rem;
                                    color: #333333;
                                }

                                hr {
                                    margin: 20px 0;
                                }

                                h2 {
                                    margin-bottom: 10px;
                                    color: #333333;
                                }

                                strong {
                                    color: #000000;
                                }
                            </style>
                        </head>

                        <body>
                            <div class="container">
                                <div class="message-box">
                                    <h1>Peringatan!</h1>
                                    <p>Konfirmasi WhatsApp Sudah Dilakukan Sebelumnya.</p>
                                    <hr>
                                    <h2>Detail Kunjungan</h2>
                                    <table border="1" width="100%" cellspacing="4" cellpadding="4" style="border-collapse: collapse; text-align: left">
                                        <tr>
                                            <td>
                                                <strong>Nama Pasien</strong>
                                            </td>
                                            <td>
                                                <strong>${
                                                    resultConfirm.data
                                                        .nama_pasien
                                                }</strong>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Dokter</strong>
                                            </td>
                                            <td>
                                                <strong>${resultConfirm?.data?.nama_pegawai ? resultConfirm.data.nama_pegawai : ''}</strong>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Klinik</strong>
                                            </td>
                                            <td>
                                                <strong>${
                                                    resultConfirm.data
                                                        .nama_bagian
                                                }</strong>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>Tanggal Kunjungan</strong>
                                            </td>
                                            <td>
                                                <strong>${moment(
                                                    resultConfirm.data.tgl_masuk
                                                ).format("DD-MM-YYYY")}</strong>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </body>

                        </html>
                        `;
                fs.writeFileSync(
                    path.join(
                        __dirname,
                        "./../../../views/whatsappconfirm.html"
                    ),
                    htmlIndex
                );
                res.sendFile(
                    path.join(
                        __dirname,
                        "./../../../views",
                        "whatsappconfirm.html"
                    )
                );
            }
        } catch (err: any) {
            console.log(err.message);
            
            let htmlIndex = `
                    <!DOCTYPE html>
                        <html lang="en">

                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Konfirmasi Berhasil</title>
                            <style>
                                * {
                                    margin: 0;
                                    box-sizing: border-box;
                                }

                                body {
                                    font-family: Arial, sans-serif;
                                    background-color: #f0f0f0;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    height: 100vh;
                                }

                                .container {
                                    text-align: center;
                                    background-color: #ffffff;
                                    padding: 50px;
                                    border-radius: 10px;
                                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                }

                                .message-box {
                                    border: 3px solid #B10F2E;
                                    padding: 20px;
                                    border-radius: 5px;
                                }   

                                h1 {
                                    color: #B10F2E;
                                    font-size: 2.5rem;
                                    margin-bottom: 20px;
                                }

                                p {
                                    font-size: 1.2rem;
                                    color: #333333;
                                }

                                hr {
                                    margin: 20px 0;
                                }

                                h2 {
                                    margin-bottom: 10px;
                                    color: #333333;
                                }

                                strong {
                                    color: #000000;
                                }
                            </style>
                        </head>

                        <body>
                            <div class="container">
                                <div class="message-box">
                                    <h1>GAGAL!</h1>
                                    <p>Konfirmasi WhatsApp Gagal.</p>
                                    <hr>
                                </div>
                            </div>
                        </body>

                        </html>
                        `;
            fs.writeFileSync(
                path.join(__dirname, "./../../../views/whatsappconfirm.html"),
                htmlIndex
            );
            res.sendFile(
                path.join(__dirname, "./../../../views", "whatsappconfirm.html")
            );
        }
    }
);
