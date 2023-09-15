import { logger } from "../config/logger";
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { constants } from "./constants";

/**
 * make a get call to a url with some optional params
 * @param url the url to call
 * @param params a map of key-value pairs to append as parameters
 * @returns the clientrequest object
 */


export async function getData<T>(data: { url: string, params?: Map<string, any>, token: string | undefined }): Promise<AxiosResponse<T>> {
    try {
        console.log('token', data.token)
        if (data.params) {
            let urlParams: string[] = [];
            data.params.forEach((value, key) => {
                urlParams.push(`${key}=${value}`)
            });
            if (data.url.includes("?")) {
                data.url += "&" + urlParams.join("&")
            }
            else {
                data.url += "?" + urlParams.join("&")
            }

        }
        logger.info({ message: `call made to ${data.url} ` })
        const response = await axios.get(data.url, {
            headers: getAuthHeaders(data.token)
        });
        logger.info({ message: `response received: ${JSON.stringify(response.data)}` })
        return response
    } catch (error) {
        logger.info({ message: `error in receiving : ${error}` })
        throw new Error(`Server error: ${error}`);
    }
}

export async function postData<T>(data: {url: string, formData: any, token:string|undefined}): Promise<AxiosResponse<T>> {
    try {
        logger.info({ message: `call made to ${data.url}. data: ${JSON.stringify(data.formData)}` });
        const response = await axios.post(data.url, data.formData, {
            headers: getAuthHeaders(data.token)
        });
        logger.info({ message: `response received: ${JSON.stringify(response.data)}` })

        return response
    } catch (error) {
        logger.info({ message: `error in receiving : ${error}` })
        throw new Error(`Server error: ${error}`);
    }
}

export async function deleteData<T>(data: { url: string, token: string | undefined }): Promise<AxiosResponse<T>> {
    try {
        logger.info({ message: `call made to ${data.url}` });
        const response = await axios.delete(data.url, {
            headers: getAuthHeaders(data.token)
        });
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
        logger.info({ message: `error sending email : ${error}` })
        throw new Error(`Server error: ${error}`);

    };
}

export function getAuthHeaders(token?:string): AxiosRequestConfig['headers'] {

    const header: AxiosRequestConfig['headers'] = {
        'token': token,
        'Content-Type': 'application/json'
    };
    return header
}
