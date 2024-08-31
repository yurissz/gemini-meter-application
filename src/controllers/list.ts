import { Request, Response } from "express";
import { PrismaClient, Prisma } from '@prisma/client'
import { IMeasure, IMeasureResponse } from "../interfaces/measure";

export const listController = async (req: Request, res: Response) => {
    const prisma = new PrismaClient();
    const { id } = req.params;
    const measure_type = req.query.measure_type?.toString().toUpperCase();

    let measures: IMeasure[] = [];
    let measureResponse: IMeasureResponse[];

    try {
        if (measure_type && measure_type !== "GAS" && measure_type !== "WATER") {
            return res.status(400).json({
                error_code: "INVALID_TYPE",
                error_description: "Tipo de medição não permitida",
            });
        }

        measures = await prisma.measures.findMany({
            where: {
                customer_code: id,
                ...(measure_type && { measure_type }),
            },
        });

        if (measures.length === 0) {
            return res.status(404).json({
                error_code: "MEASURES_NOT_FOUND",
                error_description: "Nenhuma leitura encontrada",
            });
        }

        measureResponse = measures.map(({ customer_code, measure_datatime_month, ...rest }) => rest);

        return res.status(200).json({
            customer_code: id,
            measures: measureResponse,
        });

    } catch (error) {
        console.error('Error during database operation:', error);

        if (error instanceof Prisma.PrismaClientInitializationError) {
            return res.status(500).json({
                error_code: "DATABASE_CONNECTION_ERROR",
                error_description: "Erro na inicialização do Prisma Client",
                details: error.message,
            });
        }

        return res.status(500).json({
            error_code: "INTERNAL_SERVER_ERROR",
            error_description: "Ocorreu um erro interno no servidor",
        });
    }
};
