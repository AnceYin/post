<template>
	<view class="bg-[#f4faff] min-h-screen flex flex-col items-center justify-center">
		<!-- Logo -->
		<wd-img :src="logo" class="absolute left-[214rpx] top-[244rpx] w-[324rpx] h-[324rpx] rounded-[12rpx]" />

		<!-- 微信登录按钮 -->
		<view class="flex flex-col items-center space-y-4">
			<button type="primary" open-type="getPhoneNumber" @getphonenumber="quickLogin"
				class="uni-btn bg-green-500 text-white py-3 px-6 rounded-lg">微信授权手机号登录</button>
			<!-- 隐私协议 -->
			<uni-id-pages-agreements scope="register" ref="agreements"></uni-id-pages-agreements>

			<!-- 账号密码登录 -->
			<button class="uni-btn bg-gray-500 text-white py-3 px-6 rounded-lg" @click="toPwdLogin">账号密码登录</button>
		</view>
		
		<uni-id-pages-fab-login ref="uniFabLogin"></uni-id-pages-fab-login>
	</view>
</template>


<script>
	import config from '@/uni_modules/uni-id-pages/config.js'
	import mixin from '@/uni_modules/uni-id-pages/common/login-page.mixin.js';
	export default {
		mixins: [mixin],
		data() {
			return {
				logo: "/static/logo.png"
			};
		},
		methods: {
			quickLogin(e) {
				let options = {};

				if (e.detail?.code) {
					options.phoneNumberCode = e.detail.code;
				}

				this.$refs.uniFabLogin.login_before('weixinMobile', true, options);
			},
			toPwdLogin() {
				uni.navigateTo({
					url: '../login/password'
				});
			}
		}
	};
</script>


<style lang="scss" scoped>
	
</style>
