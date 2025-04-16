import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard, JwtAuthGuard } from '@app/guard';
import { AuthGuard } from '@nestjs/passport';
import { randomUUID } from 'crypto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ForgotPasswordDTO, LoginDTO } from '@app/dto';
import { ChangePasswordDTO, RefreshTokenDTO, SetAuthenticatorDto, UserDTO, UserIDDTO, VerifyAuthenticationDto } from '@app/dto';

  

@ApiBearerAuth()
@ApiTags('Authencation')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    type:UserDTO,
    description: 'User details for creating a new user',
  })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  register(@Body() data: UserDTO) {
    return this.authService.register(data);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDTO, description: 'User credentials for login' })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  signIn(@Body() data: UserDTO) {
    return this.authService.login(data.username, data.password);
  }


  @Post('send-code-to-email')
  @ApiBody({ type: UserIDDTO , description: 'User ID for sending the code', }) 
  @ApiOperation({ summary: 'Send two-factor authentication code via email' })
  @ApiResponse({ status: 200, description: 'Code sent successfully.' })
  sendTwoFactorAuthenticationMail(@Request() req:Request) {
    return this.authService.sendTwoFactorAuthenticationMail(req.body);
  }

  @Post('verify-authentication')
  @ApiBody({ type: VerifyAuthenticationDto,  description: 'Data for verification' })
  @ApiOperation({ summary: 'Verify two-factor authentication' })
  @ApiResponse({ status: 200, description: 'Authentication successful.' })
  @ApiResponse({ status: 404, description: 'Code not found or expired.' })
  twoFactorAuthenticationLogin(@Request() req:Request) {
    return this.authService.twoFactorAuthenticationLogin(req.body);
  }

  @Post('set-authenticator')
  @ApiOperation({ summary: 'Set up two-factor authenticator' })
  @ApiResponse({ status: 200, description: 'Authenticator set successfully.' })
  @ApiBody({ type: SetAuthenticatorDto , description: 'User ID and secret for authenticator' })
  setTwoFactorAuthenticator(@Request() req:Request) {
    return this.authService.setTwoFactorAuthenticator(req.body);
  }


  @Get('authenticator-secret')
  @ApiOperation({ summary: 'Get authenticator secret' })
  @ApiResponse({ status: 200, description: 'Authenticator secret retrieved.' })
  sendAuthenticatorSecret() {
    const secret =  randomUUID().replace(/\d+/g, '').replace(/-/g, '').toUpperCase().substring(0, 10)+randomUUID().replace(/\d+/g, '').replace(/-/g, '').toUpperCase().substring(0, 10);
    return {
      data:secret
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'New access token generated.' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token.' })
  @ApiBody({ type: RefreshTokenDTO, description: 'Refresh token for generating a new access token' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved.' })
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiBody({ type: UserDTO, description: 'User details for updating the profile' })
  @ApiOperation({ summary: 'edit user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated.' })
  editProfile(@Request() req) {
    return req.user;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Login with Google' })
  async googleAuth(@Req() req) { }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google authentication callback' })
  googleAuthRedirect(@Req() req) {
    return this.authService.ssoGoogle(req)
  }

  @Get("facebook")
  @UseGuards(AuthGuard("facebook"))
  @ApiOperation({ summary: 'Login with Facebook' })
  async facebookLogin() {}

  @Get("/facebook/callback")
  @UseGuards(AuthGuard("facebook"))
  @ApiOperation({ summary: 'Facebook authentication callback' })
  async facebookLoginRedirect(@Req() req): Promise<any> {
    return this.authService.ssoFacebook(req)
  }

  @Get("x")
  @UseGuards(AuthGuard("x"))
  @ApiOperation({ summary: 'Login with X' })
  async xLogin() {}

  @Get("/x/callback")
  @UseGuards(AuthGuard("x"))
  @ApiOperation({ summary: 'X authentication callback' })
  async xLoginRedirect(@Req() req): Promise<any> {
    return {
     user: req.user
    }
  }


  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiBody({ type: ChangePasswordDTO , })
  @ApiOperation({ summary: 'Change Password' })
  @ApiResponse({ status: 200, description: 'Password successfully updated' })
  changePassword(@Request() req) {
    return this.authService.changePassword(req.user._id,req.body.currentPassword,req.body.newPassword)
  }

  // @UseGuards(JwtAuthGuard)
  @Post('forgot-password')
  @ApiBody({ type: ForgotPasswordDTO , })
  @ApiOperation({ summary: 'forgot Password' })
  @ApiResponse({ status: 200, description: 'Password successfully updated' })
  forgotPassword(@Request() req) {
    return this.authService.forgotPassword(req.body.token,req.body.code,req.body.newPassword)
  }
}

