import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client'


export const confirmController = async (req: Request, res: Response) => {
    const { measure_uuid, confirmed_value } = req.body
    const prisma = new PrismaClient()

    try {

        if (!measure_uuid) {
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "O campo measure uuid está ausente"
            })
        }

        if (!confirmed_value) {
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "O campo confirmed value está ausente"
            })
        }

        if (typeof measure_uuid !== "string") {
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "O campo measure uuid não é uma string"
            })
        }

        if (typeof confirmed_value !== "boolean") {
            return res.status(400).json({
                error_code: "INVALID_DATA",
                error_description: "O campo confirmed value não é um boolean"
            })
        }

        const isMeasureValid = await prisma.measures.findUnique({
            where: {
                measure_uuid
            }
        })

        if (isMeasureValid === null) {
            return res.status(404).json({
                error_code: "MEASURE_NOT_FOUND",
                error_description: "Leitura do mês já realizada"
            })
        }

        const isMeasureConfirmed = await prisma.measures.findUnique({
            where: {
                measure_uuid,
                has_confirmed: true
            }
        })

        if (isMeasureConfirmed !== null) {
            return res.status(404).json({
                error_code: "CONFIRMATION_DUPLICATE",
                error_description: "Leitura do mês já realizada"
            })
        }

        const updateMeasure = await prisma.measures.update({
            where: {
                measure_uuid,
            },
            data: {
                has_confirmed: true
            },
        })

        return res.status(200).json({
            sucess: confirmed_value
        })


    } catch (error) {
        console.log(error);
        res.status(500).json(error)
    }



}