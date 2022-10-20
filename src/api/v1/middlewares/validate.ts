import { Request, Response, NextFunction } from 'express'
import { Error } from '@api-v1/types'
import { validationResult } from 'express-validator'
import { BadRequestResponse } from '@api-v1/error/http-error'

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errorArr: Error[] = errors.array().map(err => {
            return { message: err.msg, field: err.param }
        })
        return BadRequestResponse(res, errorArr)
    }
    next()
}

