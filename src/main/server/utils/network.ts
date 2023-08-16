import { logger } from "../config/logger";
import axios, { AxiosResponse } from 'axios'
import { constants } from "./constants";

/**
 * make a get call to a url with some optional params
 * @param url the url to call
 * @param params a map of key-value pairs to append as parameters
 * @returns the clientrequest object
 */


export async function getData<T>(url: string, params?: Map<string, any>): Promise<AxiosResponse<T>> {
    try {
        if (params) {
            let urlParams: string[] = [];
            params.forEach((value, key) => {
                urlParams.push(`${key}=${value}`)
            });
            if (url.includes("?")) {
                url += "&" + urlParams.join("&")
            }
            else {
                url += "?" + urlParams.join("&")
            }

        }
        logger.info({ message: `call made to ${url} ` })
        const response = await axios.get(url);
        logger.info({ message: `response received: ${JSON.stringify(response.data)}` })
        return response
    } catch (error) {
        logger.info({ message: `error in receiving : ${error}` })
        throw new Error(`Server error: ${error}`);
    }
}

export async function postData<T>(url: string, data: any): Promise<AxiosResponse<T>> {
    try {
        logger.info({ message: `call made to ${url}. data: ${JSON.stringify(data)}` });
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        logger.info({ message: `response received: ${JSON.stringify(response.data)}` })

        return response
    } catch (error) {
        logger.info({ message: `error in receiving : ${error}` })
        throw new Error(`Server error: ${error}`);
    }
}

export async function deleteData<T>(url: string): Promise<AxiosResponse<T>> {
    try {
        logger.info({ message: `call made to ${url}` });
        const response = await axios.delete(url);
        logger.info({ message: `response received: ${JSON.stringify(response.data)}` })

        return response
    } catch (error) {
        logger.info({ message: `error in receiving : ${error}` })
        throw new Error(`Server error: ${error}`);
    }
}

export  async function sendEmail(message:string, recipient:string, subject:string) {

    try {
        const FormData = require('form-data');

        const form = new FormData();
        form.append('mails', recipient);
        form.append('message', message);
        form.append('subject', subject);
        const response = await axios.post(constants.server_url + `/api_admin/sendBulkMail`, form, { headers: form.getHeaders() })
        return response;
    }
    catch (error) {
        console.log(error)
        logger.info({ message: `error sending email : ${error}` })
        throw new Error(`Server error: ${error}`);

    };
}
