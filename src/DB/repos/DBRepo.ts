import { DeepPartial, Document, HydratedDocument, Model, ProjectionType, QueryFilter, QueryOptions, Types, UpdateQuery } from "mongoose";

export abstract class DBRepo<T> {
  constructor( protected readonly model: Model<T>) {}

  find = async (
    {
      filter = {},
      projection = null,
      options = {}
    }: 
    {
      filter? : QueryFilter<T>,
      projection?: ProjectionType<T> | null,
      options?: QueryOptions
    } ) =>
       {
          const docs = await this.model.find(filter, projection, options);
          return docs;
        }

  findOne = async (
    {
      filter = {},
      projection = null,
      options = {}
    }: 
    {
      filter? : QueryFilter<T>,
      projection?: ProjectionType<T> | null,
      options?: QueryOptions
    } ) =>
       {
          const doc = await this.model.findOne(filter, projection, options);
          return doc;
        }

  findById = async (
    {
      id ,
      projection = null,
      options = {}
    }: 
    {
      id : Types.ObjectId | string,
      projection?: ProjectionType<T> | null,
      options?: QueryOptions
    } ) =>
       {
          const doc = await this.model.findById(id, projection, options);
          return doc;
        }

  create = async (doc: Partial<T>):Promise<HydratedDocument<T>> => {
    const created = await this.model.create(doc as any);
    return created as HydratedDocument<T>;
  }

  updateOne = async (
    {
      filter = {},
      update,
      options = {
        new: true
      }
    }:
    {
      filter?: QueryFilter<T>,
      update: UpdateQuery<T>,
      options?: QueryOptions
    }
  ) => {
    const updatedDoc = await this.model.findOneAndUpdate(filter, update, options);
    return updatedDoc;
  }

}

