import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client'
import { IMeasure, IMeasureResponse } from "../interfaces/measure";

export const listController = async (req: Request, res: Response) => {
    const { id } = req.params
    const measure_type = req.query.measure_type?.toString().toUpperCase()
    const prisma = new PrismaClient()
    let measures: IMeasure[] | [] = []
    let measureResponse: IMeasureResponse[]
    console.log(prisma);


    try {

        if (measure_type && measure_type !== "GAS" && measure_type !== "WATER") {
            return res.status(400).json({
                error_code: "INVALID_TYPE",
                error_description: "Tipo de medição não permitida"
            })
        }

        if (measure_type) {
            measures = await prisma.measures.findMany({
                where: {
                    customer_code: id,
                    measure_type: measure_type.toString().toUpperCase()
                }
            })
        }

        if (!measure_type) {
            measures = await prisma.measures.findMany({
                where: {
                    customer_code: id,
                }
            })
        }

        if (measures.length === 0) {
            return res.status(404).json({
                error_code: "MEASURES_NOT FOUND",
                error_description: "Nenhuma leitura encontrada"
            })
        }

        measureResponse = measures.map(({ customer_code, measure_datatime_month, ...rest }) => rest)

        return res.status(200).json({
            customer_code: id,
            measures: measureResponse
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
}