import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomInt, randomUUID } from 'crypto';
import { HydratedDocument,models,model } from 'mongoose';
import * as unique from 'mongoose-unique-validator'

export type OTPDoc = HydratedDocument<OTPModel>;

@Schema({ timestamps: true })
export class OTPModel {
 
 
  @Prop({index: true, unique: true})
  code: string;

  @Prop({default:"active"})
  status: string;

  @Prop({default:30,})
  duration: number;

  @Prop({ref:"UserModel"})
  userID: string
  
}

export const OTPSchema = SchemaFactory.createForClass(OTPModel);
unique(OTPSchema)
OTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 60 });
OTPSchema.pre<OTPModel>('save', async function (next,error) {

  this.code = randomInt(100,999) + randomUUID().replace(/\D/g, '').substring(0, 3);

  
  next();
});
