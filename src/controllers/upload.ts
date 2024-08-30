import { Request, Response } from "express";
import { EnhancedGenerateContentResponse, GenerateContentResult, GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client'
import { isValid, parseISO } from 'date-fns';

export const uploadController = async (req: Request, res: Response) => {

    const prisma = new PrismaClient()
    const { image, customer_code, measure_datatime, measure_type } = req.body

    try {

        if (!image) {
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "Imagem ausente"
            })
        }

        if (!customer_code) {
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "Customer code ausente"
            })
        }

        if (!measure_datatime) {
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "Measure datatime ausente"
            })
        }

        if (!measure_type) {
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "Measure type ausente"
            })
        }

        if (typeof image !== "string") {
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "O campo image não é do tipo base64"
            })
        }

        var base64: RegExp = /^data:image\/(png|jpg|jpeg|gif);base64,[A-Za-z0-9+/]+={0,2}$/;
        const answer: boolean = base64.test(image)

        if (!answer) {
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "O campo image não é do tipo base64"
            })
        }

        if (typeof measure_datatime !== "string") {
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "O campo measure_datatime não é do tipo Data"
            });
        }

        function isValidISODate(dateString: string): boolean {
            const date = parseISO(dateString);
            return isValid(date);
        }

        if (!isValidISODate(measure_datatime))
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "O campo measure_datatime não é do tipo Data"
            });

        if (typeof measure_type !== "string") {
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "O campo measure_type não é do tipo string"
            });
        }

        if (measure_type.toUpperCase() !== 'WATER' && measure_type.toUpperCase() !== 'GAS') {
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "O campo measure_type não é dos tipos WATER ou GAS"
            });
        }

        if (typeof customer_code !== "string") {
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "O campo customer_code não é do tipo string"
            });
        }

        function getMonthFromDateString(dateString: string): number {
            const date = new Date(dateString);
            return date.getMonth() + 1;
        }

        const measure_datatime_month = getMonthFromDateString(measure_datatime)

        const measureMonth = await prisma.measures.findMany({
            where: {
                measure_datatime_month: measure_datatime_month,
                measure_type: measure_type.toUpperCase()
            }
        })

        if (measureMonth.length !== 0) {
            return res.status(409).json({
                error_code: "DOUBLE_REPORT",
                error_description: "Leitura do mês já realizada"
            })
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            throw new Error("A variável de ambiente GEMINI_API_KEY não está definida.");
        }

        const genAI = new GoogleGenerativeAI(apiKey)

        function fileToGeneratePath(base64data: any, mimeType: any) {
            return {
                inlineData: {
                    data: base64data,
                    mimeType
                }
            }
        }

        const model: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const prompt: string = "Imprima todos números que estão na imagem"
        const imageParts = [
            fileToGeneratePath(image.split(',')[1], "image/jpeg"),
        ];
        const result: GenerateContentResult = await model.generateContent([prompt, ...imageParts])
        const response: EnhancedGenerateContentResponse = await result.response
        const text: string = response.text()

        const measure_uuid: string = uuidv4()
        const measure_value: string = text

        function base64ToBlob(base64: string, type: string): Blob {
            const byteCharacters: string = atob(base64.split(',')[1]);
            const byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray: Uint8Array = new Uint8Array(byteNumbers);
            return new Blob([byteArray], { type });
        }

        function createTemporaryLink(base64: string): string {
            const blob: Blob = base64ToBlob(base64, 'image/jpeg');
            const url: string = URL.createObjectURL(blob);

            return url;
        }

        const image_url: string = createTemporaryLink(image)

        const measure = await prisma.measures.create({
            data: {
                customer_code,
                measure_uuid,
                has_confirmed: false,
                image_url,
                measure_datetime: measure_datatime,
                measure_datatime_month,
                measure_type: measure_type.toUpperCase()
            },
        })

        return res.status(200).json({
            image_url,
            measure_value,
            measure_uuid
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }

}