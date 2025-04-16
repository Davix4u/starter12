import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';



import { GlobalMongooseModule } from './global-mongoose.module';

import { ThrottlerModule } from '@nestjs/throttler'

import { MulterModule } from '@nestjs/platform-express';
import { MailerModule } from '@nestjs-modules/mailer';

import { WebSocketModule } from './web-socket/web-socket.module';
import { CaslModule } from './casl/casl.module';
import { LibsModule } from 'libs/libs.module';

@Module({
  imports: [ 
    CaslModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST||"jamfortetech.com",
        auth: {
          user: process.env.EMAIL_USERNAME||"emmanuel@jamfortetech.com",
          pass: process.env.EMAIL_PASSWORD||"Simple@1010*",
        },
      },
    }),
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: './uploads',
      }),
    }),
    GlobalMongooseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      // load: [configuration],
      // validationSchema,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),

    // BullModule.forRoot({
    //   redis: {
    //     host: 'localhost',  // Redis host (or use Redis Cloud URI)
    //     port: 6379,          // Redis port
    //   },
    // }),
    
    LibsModule,
    WebSocketModule],
  controllers: [],
  providers: [],
})
export class AppModule  {
  
}
