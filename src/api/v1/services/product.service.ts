import {
  FilterQuery,
  ProjectionType,
  QueryOptions,
  UpdateQuery
} from 'mongoose'
import Product, { ProductDocument } from '@api-v1/models/Product'
import {
  createDoc,
  getDoc,
  getAllDocs,
  deleteDoc,
  updateDoc,
  docExist,
  getNumberOfDocs
} from './db.service'

export const createProduct = (body: Partial<ProductDocument>) =>
  createDoc('Error create product', Product, body)

export const getProductExist = (
  exist: boolean,
  filter?: FilterQuery<ProductDocument>,
  projection?: ProjectionType<ProductDocument> | null,
  options?: QueryOptions<ProductDocument> | null
) =>
  docExist(
    'Error get Product exist',
    Product,
    'Product',
    exist,
    filter,
    projection,
    options
  )

export const getProduct = (
  filter?: FilterQuery<ProductDocument>,
  projection?: ProjectionType<ProductDocument> | null,
  options?: QueryOptions<ProductDocument> | null
) => getDoc('Error get product', Product, filter, projection, options)

export const getNumberOfProduct = (filter: FilterQuery<ProductDocument>) =>
  getNumberOfDocs('Error get number product', Product, filter)

export const getAllProduct = (
  filter: FilterQuery<ProductDocument>,
  projection?: ProjectionType<ProductDocument> | null,
  options?: QueryOptions<ProductDocument> | null
) => getAllDocs('Error get all product', Product, filter, projection, options)

export const deleteProduct = (
  filter: FilterQuery<ProductDocument>,
  options?: QueryOptions<ProductDocument> | null
) => deleteDoc('Error delete Product', Product, filter, options)

export const updateProduct = (
  filter: FilterQuery<ProductDocument>,
  update?: UpdateQuery<ProductDocument>,
  options?: QueryOptions<ProductDocument> | null
) => updateDoc('Error update Product', Product, filter, update, options)
