import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthStrategy } from './auth.stratagy';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';

@Module({
    imports: [
        JwtModule.register({    // 向 nest 容器注册 jwt 模块，并配置密钥和令牌有效期
            secret: 'secretKey',
            signOptions: {
                expiresIn: '24h'
            }
        }),
        forwardRef(() => UserModule)    // 处理模块间的循环依赖
    ],
    providers: [AuthService, AuthStrategy],
    controllers: [AuthController],
    exports: []  // 导出 AuthServie 供 UserModule 使用
})
export class AuthModule { }