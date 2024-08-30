export interface IMeasure {
    customer_code: string;
    measure_uuid: string;
    has_confirmed: boolean;
    image_url: string;
    measure_datetime: Date;
    measure_datatime_month: number;
    measure_type: string;
}

export interface IMeasureResponse {
    measure_uuid: string;
    measure_datetime: Date;
    measure_type: string;
    has_confirmed: boolean;
    image_url: string;
}