
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define translations
const translations = {
  en: {
    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    error: 'Error',
    success: 'Success',
    close: 'Close',
    ok: 'OK',
    yes: 'Yes',
    no: 'No',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    share: 'Share',
    copy: 'Copy',
    copied: 'Copied!',
    or: 'or',
    total: 'Total',
    continue: 'Continue',
    
    // Auth
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Full Name',
    idNumber: 'ID Number',
    address: 'Address',
    referralCode: 'Referral Code (Optional)',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    signIn: 'Sign In',
    signUp: 'Sign Up',
    createAccount: 'Create Account',
    forgotPassword: 'Forgot Password?',
    rememberPassword: 'Remember password',
    enterYourEmail: 'your@email.com',
    enterYourPassword: 'Enter your password',
    
    // App Layout - NEW
    offlineTitle: '🔌 You are offline',
    offlineMessage: 'You can keep using the app! Your changes will be saved locally and synced when you are back online.',
    standardModalTitle: 'Standard Modal',
    formSheetModalTitle: 'Form Sheet Modal',
    
    // Tabs - NEW
    tabHome: 'Home',
    tabProfile: 'Profile',
    tabDeposit: 'Deposit',
    tabWithdraw: 'Withdraw',
    tabReferrals: 'Referrals',
    tabTournaments: 'Tournaments',
    tabRewards: 'Rewards',
    tabEcosystem: 'Ecosystem',
    
    // Login Page
    mxiStrategicPresale: 'MXI Strategic PreSale',
    secureYourPosition: 'Secure Your Position in the Future',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    loginButton: 'Login',
    recoverPassword: 'Recover Password',
    contactSupport: 'Contact Support',
    sendEmailTo: 'Send an email to:',
    pleaseVerifyEmailBeforeLogin: 'Please verify your email before logging in.',
    resendEmailButton: 'Resend Email',
    emailVerificationSent: 'Verification email sent. Please check your inbox.',
    errorResendingEmail: 'Error resending verification email',
    recoverPasswordTitle: 'Recover Password',
    recoverPasswordMessage: 'Please contact technical support to recover your password.',
    supportEmail: 'support@mxi-strategic.com',
    presaleClosesOn: 'The Pre-Sale closes on February 15, 2026 at 12:00 UTC',
    
    // Register Page
    joinMXIStrategicPresale: 'Join MXI Strategic PreSale',
    fullName: 'Full Name',
    minimumSixCharacters: 'Minimum 6 characters',
    reEnterPassword: 'Re-enter password',
    enterReferralCode: 'Enter referral code',
    onlyOneAccountPerPerson: 'Only one account per person is allowed. Your ID number will be verified.',
    iHaveReadAndAccept: 'I have read and accept the',
    termsAndConditions: 'Terms and Conditions',
    alreadyHaveAccountLogin: 'Already have an account?',
    termsAndConditionsRequired: 'Terms and Conditions Required',
    youMustAcceptTerms: 'You must accept the Terms and Conditions to create an account',
    accountCreatedSuccessfully: 'Account created successfully! Please check your email to verify your account before logging in.',
    failedToCreateAccount: 'Failed to create account. Please try again.',
    acceptTermsButton: 'Accept Terms',
    
    // Terms and Conditions Content
    termsContent: `TERMS AND CONDITIONS OF USE

MXI STRATEGIC PRESALE – APP VERSION

MAXCOIN (MXI) is a registered trademark of MXI Strategic Holdings Ltd., Cayman Islands.
App operated by MXI Technologies Inc. (Panama).
Last update: 01/15/2026 – Version 1.0

1. Acceptance

By creating an account or using the MXI Strategic Presale application (the "App"), you accept these Terms and Conditions.
If you do not agree with them, you should not use the App.

2. About MXI

MXI Strategic Holdings Ltd. (Cayman) is the entity that owns the MXI token, brand, and intellectual property.

MXI Technologies Inc. (Panama) is the company that operates the App and is responsible for its operation.

3. App Function

The App allows:

- Register users
- Purchase MXI tokens with USDT (via Binance)
- Access a referral system
- View balances, yields, and movements
- Request withdrawals of commissions and/or MXI according to current rules

4. Eligibility

To use the App, you must:

- Be over 18 years old
- Have legal capacity to contract
- Provide truthful data
- Not live in countries where cryptocurrencies are prohibited

5. Registration and Account

- Only one account per person is allowed
- KYC completion is mandatory to enable withdrawals
- Registered information must match official documents
- Identification numbers cannot be repeated

6. Purchase of MXI Tokens

- Minimum purchase: 50 USDT
- Maximum per user: 100,000 USDT
- Payment exclusively in USDT through Binance
- The number of tokens received depends on the presale phase

7. Referral System

Commission structure:

- Level 1: 5%
- Level 2: 2%
- Level 3: 1%

Requirements to withdraw commissions:

- 5 active referrals
- 10 days since registration
- Approved KYC
- Each referral must have made at least one purchase

8. Yields and Vesting

- Yield: 0.005% per hour
- Unified commissions also generate yield
- Yields do not increase vesting
- 10 active referrals are required to unify vesting to main balance

9. Withdrawals

9.1 Commission withdrawals (USDT)

Requirements:

- 5 active referrals
- 10 days of membership
- Approved KYC
- Valid USDT wallet

9.2 MXI withdrawals

Requirements:

- 5 active referrals
- Approved KYC

Phased release if amount exceeds 50,000 USDT:

- 10% initial
- +10% every 7 days

10. Mandatory KYC

Will be requested:

- Valid official document
- Photographs
- Selfie (proof of life)
- Verifiable information

11. Risks

Investing in cryptocurrencies involves risks:

- Extreme volatility
- Total or partial loss of capital
- Regulatory changes
- Technological and cybersecurity risks

MXI Strategic does not guarantee profits or fixed returns.

12. Prohibited Conduct

Not allowed:

- Create multiple accounts
- Provide false data
- Manipulate referrals
- Use the App for illegal activities
- Process money laundering

13. Limitation of Liability

The App is offered "as is".
Neither MXI Strategic Holdings Ltd. nor MXI Technologies Inc. are responsible for:

- Economic losses
- Third-party or blockchain errors
- Indirect or incidental damages
- Misuse of the App

14. Final Acceptance

By registering, you declare that:

- You read and understand these Terms
- You accept the risks
- You provide truthful information
- You comply with the laws of your country

15. MXI TOKEN USE POLICY

The MXI token is a digital asset in pre-launch stage, with no commercial value, no public listing, and no recognition as legal tender in Colombia, Spain, Mexico, or any other jurisdiction. Its use within the platform is exclusively functional, intended for internal rewards, participation in gamified activities, and access to MXI ecosystem benefits.

MXI does not represent investments, property rights, guaranteed profitability, equity participation, financial instruments, negotiable securities, or similar products. Users accept that the use of the token is experimental, subject to changes, and dependent on technical and regulatory validation processes.

Any future value, convertibility, or listing of the token will depend on conditions external to the company, regulatory processes, and market decisions that cannot be guaranteed. The platform does not ensure economic benefits, appreciation, or any return associated with MXI.

16. LEGAL ANNEX – MXI GAMES AND REWARDS

The dynamics available within the platform (including challenges, mini-games such as tap, clicker, "AirBall", skill challenges, and the "Bonus MXI" modality) are based exclusively on skill, speed, precision, or active user participation, and do not depend on chance to determine results.

No activity offered should be interpreted as:

- gambling,
- betting,
- lottery for profit,
- regulated raffles,
- state or private lotteries,
- or equivalent mechanisms regulated in Colombia, Spain, or Mexico.

Access to these dynamics may require a symbolic payment in MXI, but such payment does not constitute a bet, since the token has no real economic value and is used solely as an internal participation mechanism.

The "Bonus MXI" modality, including random prize allocation, is carried out outside the main platform, through independent, transparent, and verifiable processes, whose purpose is to distribute promotional rewards in MXI without constituting a regulated game of chance.

Users accept that the rewards granted are promotional, digital, and without commercial value, and that participation in any dynamic does not guarantee real economic gains.

---

**IMPORTANT**: These terms and conditions are legally binding. If you do not agree with any part, you should not use the Application. It is recommended to consult with a legal or financial advisor before making investments in cryptocurrencies.

**Effective date**: January 15, 2026
**Version**: 1.0`,
    
    // Home
    hello: 'Hello',
    welcomeToMXI: 'Welcome to MXI Pool',
    phasesAndProgress: '🚀 Phases and Progress',
    currentPhase: 'Current Phase',
    phase: 'Phase',
    sold: 'Sold',
    remaining: 'Remaining',
    generalProgress: '📈 General Progress',
    of: 'of',
    totalMXIDelivered: '💰 Total MXI Delivered',
    mxiDeliveredToAllUsers: 'MXI delivered to all users (purchases + commissions + challenges + vesting)',
    poolClose: 'Pool Close',
    perMXI: 'per MXI',
    
    // Launch Countdown
    officialLaunch: 'OFFICIAL LAUNCH',
    maxcoinMXI: 'Maxcoin (MXI)',
    poolActive: 'Pool Active',
    vestingRealTime: 'Vesting Real-Time',
    days: 'DAYS',
    hours: 'HRS',
    minutes: 'MIN',
    seconds: 'SEC',
    launchDate: '15 Feb 2026 • 12:00 UTC',
    
    // Total MXI Balance Chart
    totalMXIBalance: '📊 Total MXI Balance',
    allSourcesIncluded: 'All sources included',
    chartShowsTotalBalance: 'This chart shows your TOTAL MXI balance including: direct purchases, commissions, tournaments and vesting. Vesting is generated ONLY from directly purchased MXI.',
    generatingChartData: 'Generating chart data...',
    loadingChart: 'Loading chart...',
    mxiTotal: 'MXI Total',
    purchased: 'Purchased',
    commissions: 'Commissions',
    tournaments: 'Tournaments',
    vesting: 'Vesting',
    completeBreakdown: '📊 Complete MXI Breakdown',
    mxiPurchased: 'MXI Purchased',
    mxiCommissions: 'MXI Commissions',
    mxiTournaments: 'MXI Tournaments',
    vestingRealTimeLabel: 'Vesting (Real-Time)',
    updatingEverySecond: 'Updating every second',
    
    // Yield Display
    vestingMXI: '🔥 Vesting MXI (Active Mining)',
    generatingPerSecond: '⚡ Generating {{rate}} MXI per second',
    mxiPurchasedVestingBase: '🛒 MXI Purchased (Vesting Base)',
    onlyPurchasedMXIGeneratesVesting: 'ℹ️ Only purchased MXI generates vesting yield',
    currentSession: '💰 Current Session',
    totalAccumulated: '📊 Total Accumulated',
    perSecond: 'Per Second',
    perMinute: 'Per Minute',
    perHour: 'Per Hour',
    dailyYield: '📈 Daily Yield',
    claimYield: '💎 Claim Yield',
    claiming: 'Claiming...',
    yieldInfo: 'Mining rate: 0.005% per hour of your purchased MXI. Only directly purchased MXI generates vesting yield. Commissions DO NOT generate vesting. To claim your mined MXI, you need 5 active referrals, 10 days membership and KYC approval. Remember that for vesting you must have 10 active referrals and it will be unlocked once the token is launched and listed on exchanges.',
    noYield: 'No Yield',
    needMoreYield: 'You need to accumulate more yield before claiming.',
    requirementsNotMet: 'Requirements Not Met',
    claimRequirements: 'To claim your mined MXI, you need:\n\n- 5 active referrals (you have {{count}})\n- 10 days membership\n- KYC verification approved\n\nOnce you meet these requirements, you can claim your accumulated yield.',
    kycRequired: 'KYC Required',
    kycRequiredMessage: 'You need to complete KYC verification before claiming your mined MXI. Please go to the KYC section to verify your identity.',
    yieldClaimed: 'Yield Claimed!',
    yieldClaimedMessage: 'You have successfully claimed {{amount}} MXI and it has been added to your vesting balance!',
    claimFailed: 'Claim Failed',
    
    // Deposit Page
    deposit: 'Deposit',
    buyMXIWithMultipleOptions: 'Buy MXI with multiple payment options',
    currentBalance: 'Current Balance',
    usdtContributed: 'USDT Contributed',
    currentPresalePhase: '🚀 Current Presale Phase',
    activePhase: 'Active Phase',
    phaseOf: 'Phase {{current}} of {{total}}',
    currentPrice: 'Current Price',
    tokensSold: 'Tokens Sold',
    untilNextPhase: 'Until Next Phase',
    paymentOptions: '💳 Payment Options',
    chooseYourPreferredPaymentMethod: 'Choose your preferred payment method',
    multiCryptoPayment: 'Multi-Crypto Payment',
    availableCryptocurrencies: '+50 Available Cryptocurrencies',
    bitcoinEthereumUSDTUSDC: 'Bitcoin, Ethereum, USDT, USDC',
    multipleNetworks: 'Multiple Networks (ETH, BSC, TRX, SOL)',
    automaticConfirmation: 'Automatic Confirmation',
    directUSDTPayment: 'Direct USDT Payment',
    manualUSDTTransfer: 'Manual USDT Transfer',
    usdtOnMultipleNetworks: 'USDT on multiple networks',
    manualVerificationAvailable: 'Manual verification available',
    dedicatedSupport: 'Dedicated support',
    manualPaymentVerification: 'Manual Payment Verification',
    requestManualVerificationOfPayments: 'Request manual verification of your NowPayments and USDT payments',
    completePaymentHistory: 'Complete payment history',
    verificationByAdministrator: 'Verification by administrator',
    responseInLessThan2Hours: 'Response in less than 2 hours',
    transactionHistory: 'Transaction History',
    viewVerifyAndManageYourPayments: 'View, verify and manage your payments',
    supportedCryptocurrencies: '🪙 Supported Cryptocurrencies',
    payWithAnyOfTheseCoinsAndMore: 'Pay with any of these coins and more',
    bitcoin: 'Bitcoin',
    ethereum: 'Ethereum',
    usdt: 'USDT',
    usdc: 'USDC',
    bnb: 'BNB',
    solana: 'Solana',
    litecoin: 'Litecoin',
    more50Plus: '+50 more',
    howItWorks: '📋 How It Works',
    chooseYourPaymentMethod: 'Choose your Payment Method',
    selectBetweenMultiCryptoOrDirectUSDT: 'Select between multi-crypto payment or direct USDT transfer',
    enterTheAmount: 'Enter the Amount',
    specifyHowMuchUSDTYouWantToInvest: 'Specify how much USDT you want to invest (minimum 2 USDT)',
    makeThePayment: 'Make the Payment',
    sendTheExactAmountToTheProvidedAddress: 'Send the exact amount to the provided address',
    receiveYourMXI: 'Receive your MXI',
    tokensWillBeCreditedAutomatically: 'Tokens will be credited automatically after confirmation',
    advantagesOfOurPaymentSystem: '✨ Advantages of Our Payment System',
    automaticConfirmationInMinutes: 'Automatic confirmation in minutes',
    secureAndVerifiedOnBlockchain: 'Secure and verified on blockchain',
    multiplePaymentOptionsAvailable: 'Multiple payment options available',
    available247WithoutIntermediaries: 'Available 24/7 without intermediaries',
    quickStats: 'Quick Stats',
    paymentMethods: 'Payment Methods',
    cryptocurrencies: 'Cryptocurrencies',
    available247: 'Available 24/7',
    
    // Withdrawals Page
    withdrawals: 'Withdrawals',
    withdraw: 'Withdraw',
    loadingData: 'Loading data...',
    updatingBalances: 'Updating balances...',
    mxiAvailable: 'MXI Available',
    totalMXI: 'Total MXI',
    approximateUSDT: '≈ {{amount}} USDT',
    mxiPurchasedLabel: 'MXI Purchased',
    lockedUntilLaunch: '🔒 Locked until launch',
    mxiCommissionsLabel: 'MXI Commissions',
    availableLabel: '✅ Available',
    mxiVestingLabel: 'MXI Vesting',
    realTime: 'Real Time',
    mxiTournamentsLabel: 'MXI Tournaments',
    withdrawalType: 'Withdrawal Type',
    withdrawMXIPurchased: 'Withdraw MXI Purchased',
    mxiAcquiredThroughUSDTPurchases: 'MXI acquired through USDT purchases',
    withdrawMXICommissions: 'Withdraw MXI Commissions',
    mxiFromReferralCommissions: 'MXI from referral commissions',
    withdrawMXIVesting: 'Withdraw MXI Vesting',
    mxiGeneratedByYield: 'MXI generated by yield (3% monthly)',
    withdrawMXITournaments: 'Withdraw MXI Tournaments',
    mxiWonInTournamentsAndChallenges: 'MXI won in tournaments and challenges',
    withdrawalDetails: 'Withdrawal Details',
    withdrawalsInUSDTETH: '⚠️ Withdrawals are made in USDT(ETH). Enter the amount in MXI.',
    amountMXI: 'Amount (MXI)',
    maximum: 'Maximum',
    walletAddressETH: 'Wallet Address (ETH)',
    enterYourETHWalletAddress: 'Enter your ETH wallet address',
    requestWithdrawal: 'Request Withdrawal',
    amountInMXI: 'Amount in MXI:',
    equivalentInUSDT: 'Equivalent in USDT:',
    rate: 'Rate: 1 MXI = 0.4 USDT',
    withdrawalRequirements: '📋 Withdrawal Requirements',
    kycApproved: 'KYC Approved',
    activeReferralsForGeneralWithdrawals: '5 Active Referrals for general withdrawals ({{count}}/5)',
    activeReferralsForVestingWithdrawals: '10 Active Referrals for Vesting withdrawals ({{count}}/10)',
    mxiLaunchRequiredForPurchasedAndVesting: 'MXI launch required for purchased MXI and vesting withdrawals',
    importantInformation: 'Important Information',
    withdrawalsInUSDTETHInfo: '- Withdrawals in USDT(ETH): All withdrawals are processed in USDT on the Ethereum network',
    conversionInfo: '- Conversion: 1 MXI = 0.4 USDT',
    mxiCommissionsInfo: '- MXI Commissions: Available for immediate withdrawal (requires 5 active referrals + KYC)',
    mxiTournamentsInfo: '- MXI Tournaments: Available for withdrawal in the same way as commissions',
    mxiVestingInfo: '- MXI Vesting: Requires 10 referrals with MXI purchases + official launch',
    mxiPurchasedInfo: '- MXI Purchased: Locked until the official launch of MXI',
    realTimeUpdateInfo: '- Real-Time Update: Vesting balances are updated every second',
    processingTime: '- Processing time: 24-48 hours',
    verifyWalletAddress: '- Carefully verify the ETH wallet address',
    viewWithdrawalHistory: 'View Withdrawal History',
    invalidAmount: 'Invalid Amount',
    pleaseEnterValidAmount: 'Please enter a valid amount',
    missingInformation: 'Missing Information',
    pleaseEnterYourWalletAddress: 'Please enter your wallet address',
    insufficientBalance: 'Insufficient Balance',
    youDoNotHaveEnoughAvailable: 'You do not have enough {{type}} available',
    requirementNotMet: 'Requirement Not Met',
    youNeedAtLeast10ActiveReferrals: 'You need at least 10 active referrals with MXI purchases to withdraw Vesting.\n\nCurrently you have: {{count}} active referrals.',
    withdrawalNotAvailable: 'Withdrawal Not Available',
    withdrawalsWillBeAvailableAfterLaunch: '{{type}} withdrawals will be available after the official launch of MXI.\n\nTime remaining: {{days}} days',
    notEligible: 'Not Eligible',
    youNeedAtLeast5ActiveReferrals: 'You need at least 5 active referrals and approved KYC to withdraw',
    confirmWithdrawal: 'Confirm Withdrawal',
    youAreAboutToWithdraw: 'You are about to withdraw:\n\n{{amount}} MXI ({{type}})\n≈ {{usdt}} USDT\n\nConversion rate: 1 MXI = 0.4 USDT\n\nDo you want to continue?',
    requestSent: 'Request Sent',
    yourWithdrawalRequestHasBeenSent: 'Your withdrawal request has been sent successfully:\n\n{{amount}} MXI ({{type}})\n≈ {{usdt}} USDT (ETH)\n\nIt will be processed in 24-48 hours.',
    withdrawalError: 'Withdrawal Error',
    couldNotProcessWithdrawal: 'Could not process the withdrawal. Please try again.',
    errorProcessingWithdrawal: 'An error occurred while processing the withdrawal',
    withdrawalHistory: 'Withdrawal History',
    
    // Referrals Page
    referrals: 'Referrals',
    myReferrals: 'My Referrals',
    referralSystem: 'Referral System',
    yourReferralCode: 'Your Referral Code',
    shareCode: 'Share Code',
    commissionBalance: 'Commission Balance (MXI)',
    totalEarned: 'Total Earned',
    available: 'Available',
    level: 'Level',
    activeReferrals: 'Active Referrals',
    howReferralsWork: 'How Referrals Work',
    allCommissionsInMXI: 'All commissions are handled internally in MXI',
    withdrawToBalanceMXI: 'Withdraw to MXI Balance',
    transferCommissionsDescription: 'Transfer your commissions to your main MXI balance to use them for purchases and other functions.',
    withdrawToBalance: 'Withdraw to Balance',
    amountToWithdraw: 'Amount to Withdraw (MXI)',
    minimum50MXI: 'Minimum 50 MXI',
    availableAmount: 'Available',
    requirements: 'Requirements',
    activeReferralsRequired: 'active referrals required',
    minimumAmount: 'Minimum',
    yourReferrals: 'Your Referrals',
    activeReferralsLevel1: 'Active Referrals (Level 1)',
    shareReferralCode: 'Share your referral code with friends',
    earn5PercentLevel1: 'Earn 5% in MXI from Level 1 referrals',
    earn2PercentLevel2: 'Earn 2% in MXI from Level 2 referrals',
    earn1PercentLevel3: 'Earn 1% in MXI from Level 3 referrals',
    allCommissionsCreditedMXI: 'All commissions are credited directly in MXI',
    need5ActiveReferrals: 'Need 5 active Level 1 referrals to withdraw',
    minimumWithdrawal: 'Minimum Withdrawal',
    minimumWithdrawalIs50MXI: 'The minimum withdrawal is 50 MXI',
    youOnlyHaveAvailable: 'You only have',
    availableFromCommissions: 'available from commissions',
    youNeed5ActiveReferrals: 'You need 5 active referrals who have purchased the minimum MXI.',
    currentlyYouHave: 'Currently you have:',
    confirmWithdrawalToBalance: 'Confirm Withdrawal to MXI Balance',
    doYouWantToTransfer: 'Do you want to transfer',
    fromCommissionsToMainBalance: 'from commissions to your main balance?',
    thisWillAllowYouToUse: 'This will allow you to use these MXI for purchases and other functions.',
    withdrawalSuccessful: 'Withdrawal Successful',
    transferredToMainBalance: 'have been transferred to your main balance',
    referralsText: 'referrals',
    couldNotCompleteWithdrawal: 'Could not complete the withdrawal',
    unexpectedError: 'An unexpected error occurred',
    commissionsByReferrals: 'Commissions by Referrals',
    totalEarnedByReferrals: 'Total Earned by Referrals',
    howCommissionsWork: 'How Commissions Work',
    commissionsCalculatedOnMXI: 'Commissions are calculated on the MXI amount purchased',
    commissionsAutomaticallyCredited: 'Commissions are automatically credited in MXI',
    requirementsToWithdraw: 'Requirements to Withdraw',
    
    // Tournaments Page
    tournamentsTitle: 'Tournaments',
    availableGames: 'Available Games',
    distributionOfRewards: 'Distribution of Rewards',
    winner: 'Winner',
    prizeFund: 'Prize Fund',
    onlyUseCommissionsOrChallenges: 'You can only use MXI from commissions or challenge winnings',
    players: 'Players',
    joiningGame: 'Joining game...',
    selectPlayers: 'Select Players',
    asFirstPlayerChoosePlayers: 'As the first player, choose how many players will participate in this tournament:',
    createTournamentOf: 'Create Tournament of {{count}} Players',
    participateFor: 'Participate for {{fee}} MXI?',
    prize: 'Prize',
    insufficientBalanceNeed: 'You need {{needed}} MXI. You have {{available}} MXI available.',
    
    // Rewards Page
    rewards: 'Rewards',
    earnMXIMultipleWays: 'Earn MXI in multiple ways',
    loadingRewards: 'Loading rewards...',
    totalMXIEarned: 'Total MXI Earned',
    bonus: 'Bonus',
    rewardPrograms: 'Reward Programs',
    participationBonus: 'Participation Bonus',
    participateInWeeklyDrawings: 'Participate in weekly drawings and win big prizes',
    active: 'Active',
    vestingAndYield: 'Vesting & Yield',
    generatePassiveIncome: 'Generate passive income automatically',
    live: 'Live',
    earnCommissionsFrom3Levels: 'Earn commissions from 3 levels by referring friends',
    actives: 'actives',
    moreRewardsComingSoon: 'More Rewards Coming Soon',
    workingOnNewRewards: 'We are working on exciting new reward programs:',
    tournamentsAndCompetitions: 'Tournaments and competitions',
    achievementBonuses: 'Achievement bonuses',
    loyaltyRewards: 'Loyalty rewards',
    specialEvents: 'Special events',
    benefitsOfRewards: 'Benefits of Rewards',
    earnAdditionalMXI: 'Earn additional MXI tokens without extra investment',
    participateInExclusiveDrawings: 'Participate in exclusive drawings with big prizes',
    generateAutomaticPassiveIncome: 'Generate automatic passive income 24/7',
    bonusesForActiveReferrals: 'Bonuses for active referrals up to 3 levels',
    rewardsForContinuedParticipation: 'Rewards for continued participation',
    maximizeYourRewards: 'Maximize Your Rewards',
    keepAtLeast5ActiveReferrals: 'Keep at least 5 active referrals to unlock withdrawals',
    participateRegularlyInBonus: 'Participate regularly in the participation bonus to increase your chances',
    activateVestingForPassiveIncome: 'Activate vesting to generate continuous passive income',
    shareYourReferralCodeSocial: 'Share your referral code on social media',
    
    // Ecosystem Page
    ecosystem: '🌐 MXI Ecosystem',
    liquidityPool: 'Maxcoin Liquidity Pool',
    whatIsMXI: 'What is MXI? 💎',
    howItWorksTab: 'How does it work? 🚀',
    whyBuy: 'Why buy? 💰',
    meta: 'META 🎯',
    ecosystemTab: 'Ecosystem 🌱',
    quantumSecurity: 'Quantum Security 🔐',
    sustainability: 'Sustainability ♻️',
    dailyVesting: 'Daily Vesting 💎',
    inPractice: 'In Practice 📊',
    tokenomics: 'Tokenomics 🪙',
    
    // Profile Page
    profile: 'Profile',
    editProfile: 'Edit Profile',
    updateYourInformation: 'Update your information',
    completeYourIdentityVerification: 'Complete your identity verification',
    viewPreviousWithdrawals: 'View previous withdrawals',
    
    // Language
    language: 'Language',
    selectLanguage: 'Select Language',
    english: 'English',
    spanish: 'Spanish',
    portuguese: 'Portuguese',
    
    // KYC
    kycVerification: 'KYC Verification',
    kycStatus: 'KYC Status',
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
    notSubmitted: 'Not Submitted',
    completeYourKYCVerification: 'Complete your identity verification',
    verificationStatus: 'Verification Status',
    verifiedOn: 'Verified on',
    yourKYCIsBeingReviewed: 'Your KYC verification is being reviewed. This typically takes 24-48 hours.',
    rejectionReason: 'Rejection Reason',
    pleaseCorrectIssues: 'Please correct the issues mentioned and resubmit your verification.',
    whyKYCRequired: 'Why KYC is required:',
    kycMandatoryForWithdrawals: 'KYC verification is mandatory for all withdrawals',
    helpPreventFraud: 'Helps prevent fraud and money laundering',
    ensureCompliance: 'Ensures compliance with financial regulations',
    protectYourAccount: 'Protects your account and funds',
    oneTimeVerification: 'One-time verification process',
    personalInformation: 'Personal Information',
    fullLegalName: 'Full Legal Name',
    enterFullNameAsOnID: 'Enter your full name as it appears on your ID',
    documentType: 'Document Type',
    nationalID: 'National ID',
    passport: 'Passport',
    driversLicense: 'Driver\'s License',
    documentNumber: 'Document Number',
    enterYourDocumentNumber: 'Enter your document number',
    frontDocument: 'Front Document *',
    uploadClearPhotoOfFront: 'Upload a clear photo of the front of your ID document',
    uploading: 'Uploading...',
    tapToChange: 'Tap to change',
    tapToUploadFront: 'Tap to upload front',
    backDocument: 'Back Document *',
    uploadClearPhotoOfBack: 'Upload a clear photo of the back of your ID document',
    tapToUploadBack: 'Tap to upload back',
    submitting: 'Submitting...',
    submitKYCVerification: 'Submit KYC Verification',
    yourDataIsSecure: 'Your Data is Secure',
    dataEncryptedAndSecure: 'All personal information and documents are encrypted and stored securely. We comply with international data protection regulations and will never share your information with third parties without your consent.',
    kycVerified: 'KYC Verified!',
    identityVerifiedSuccessfully: 'Your identity has been verified successfully. You can now withdraw your funds once you meet all other requirements.',
    kycSubmittedSuccessfully: 'KYC Submitted Successfully',
    kycUnderReview: 'Your KYC verification has been submitted and is under review. You will be notified once it has been processed (typically within 24-48 hours).',
    submissionError: 'Submission Error',
    errorSubmittingKYC: 'Error submitting KYC verification. Please try again or contact support if the problem persists.',
    
    // Balance
    balance: 'Balance',
    totalBalance: 'Total Balance',
    mxiFromVesting: 'MXI from Vesting',
    mxiFromTournaments: 'MXI from Tournaments',
    mxiBalance: 'MXI Balance',
    internalSimulatedBalance: 'Internal simulated balance',
    aboutYourMXIBalance: 'About your MXI Balance',
    thisIsYourInternalBalance: 'This is your internal MXI balance obtained through USDT ERC20 payments',
    conversionRate: 'Conversion rate: 1 USDT = 2.5 MXI',
    paymentsVerifiedAutomatically: 'Payments are verified automatically on the Ethereum blockchain',
    requiresThreeConfirmations: 'At least 3 confirmations are required to credit the balance',
    quickActions: 'Quick Actions',
    addBalance: 'Add Balance',
    payWithUSDT: 'Pay with USDT ERC20',
    viewTransactions: 'View transactions',
    
    // Vesting
    vesting: 'Vesting',
    yieldGeneration: 'Yield Generation',
    viewYieldGeneration: 'View yield generation',
    vestingSource: '⚠️ Vesting Source',
    vestingSourceDescription: 'Vesting is generated ONLY from MXI purchased directly with USDT. Commissions DO NOT generate vesting. This chart represents the user\'s personal growth in MXI: purchases, expenses, losses, etc.',
    mxiPurchasedBase: 'MXI Purchased (Vesting Base)',
    mxiInVesting: 'MXI in Vesting',
    availableForWithdrawal: 'Available for withdrawal once the coin is launched',
    blockedUntilLaunch: 'Blocked until official launch',
    daysRemaining: 'days',
    balanceBlocked: 'Balance Blocked',
    balanceBlockedDescription: 'The vesting balance cannot be unified or withdrawn until the coin is officially launched. Once launched, you can withdraw your balance by meeting the withdrawal requirements (5 active referrals and approved KYC).',
    timeUntilLaunch: 'Time until launch:',
    released: 'Released',
    releasePercentage: 'Release percentage:',
    releasesCompleted: 'Releases completed:',
    nextRelease: 'Next release:',
    withdrawalStatus: 'Withdrawal status:',
    enabled: 'Enabled',
    blockedUntilLaunchShort: 'Blocked until launch',
    whatIsVesting: 'What is Vesting?',
    vestingDescription: 'Vesting is a mechanism that gradually releases your MXI tokens obtained through yield/return on purchased MXI. This ensures market stability and protects the coin\'s value.',
    vestingReleaseInfo: 'Every 10 days, {{percentage}}% of your vesting balance is released, which you can withdraw once you meet the requirements (5 active referrals and approved KYC).',
    vestingReleaseInfoPreLaunch: 'Once the coin is launched, every 10 days {{percentage}}% of your vesting balance will be released for withdrawal.',
    vestingImportantNote: '⚠️ Important: Only MXI purchased directly generates vesting yield. Commissions DO NOT generate vesting. The "MXI Balance" chart shows your personal growth in MXI, not the vesting itself.',
    withdrawMXI: 'Withdraw MXI',
    withdrawVestingBalance: 'Withdraw your released vesting balance',
    vestingInformation: 'Vesting Information',
    everyTenDays: 'every 10 days',
    
    // Support
    support: 'Support',
    getHelp: 'Get Help',
    getAssistanceFromOurTeam: 'Get assistance from our team',
    newSupportRequest: 'New Support Request',
    category: 'Category',
    general: 'General',
    kyc: 'KYC',
    withdrawal: 'Withdrawal',
    transaction: 'Transaction',
    technical: 'Technical',
    other: 'Other',
    subject: 'Subject',
    briefDescriptionOfIssue: 'Brief description of your issue',
    message: 'Message',
    describeYourIssueInDetail: 'Describe your issue in detail...',
    sendMessage: 'Send Message',
    yourMessageHasBeenSent: 'Your message has been sent. Our support team will respond soon.',
    failedToSendMessage: 'Failed to send message',
    noMessagesYet: 'No messages yet',
    createSupportRequest: 'Create a support request to get help from our team',
    messageDetail: 'Message detail view coming soon',
    replies: 'replies',
    
    // Challenges
    challengeHistory: 'Challenge History',
    viewGameRecords: 'View game records',
    all: 'All',
    wins: 'Wins',
    losses: 'Losses',
    noHistoryYet: 'No History Yet',
    challengeHistoryWillAppear: 'Your challenge history will appear here once you participate in games',
    score: 'Score',
    rank: 'Rank',
    won: 'Won',
    lost: 'Lost',
    expiresIn: 'Expires in',
    tournamentWinnings: 'Tournament Winnings',
    totalWon: 'Total Won',
    withdrawToMXIBalance: 'Withdraw to MXI Balance',
    transferWinningsToMainBalance: 'Transfer your winnings to your main MXI balance to use them for purchases and other functions.',
    amountToWithdrawMXI: 'Amount to Withdraw (MXI)',
    minimum50MXIRequired: 'Minimum 50 MXI',
    invalidAmountEnterValid: 'Invalid Amount. Please enter a valid amount',
    minimumWithdrawalIs50: 'The minimum withdrawal is 50 MXI',
    insufficientBalanceOnlyHave: 'You only have {{available}} MXI available from tournament winnings',
    requirementsNotMetNeed5Referrals: 'You need 5 active referrals who have purchased the minimum MXI.\n\nCurrently you have: {{count}} active referrals',
    confirmWithdrawalToMXIBalance: 'Confirm Withdrawal to MXI Balance',
    doYouWantToTransferFromWinnings: 'Do you want to transfer {{amount}} MXI from tournament winnings to your main balance?\n\nThis will allow you to use these MXI for purchases and other functions.',
    withdrawalSuccessfulTransferred: '{{amount}} MXI have been transferred to your main balance',
    
    // Lottery/Bonus
    loadingBonus: 'Loading bonus...',
    noActiveBonusRound: 'No active bonus round',
    retry: 'Retry',
    round: 'Round',
    open: 'Open',
    locked: 'Locked',
    prizePool: 'Prize Pool (90%)',
    totalPool: 'Total Pool',
    ticketsSold: 'Tickets Sold',
    ticketPrice: 'Ticket Price',
    yourTickets: 'Your Tickets',
    availableMXI: 'Available MXI',
    purchaseTickets: 'Purchase Tickets',
    buyBetween1And20Tickets: 'Buy between 1 and 20 tickets. Maximum 20 tickets per user per round.',
    buyTickets: 'Buy Tickets',
    numberOfTickets: 'Number of Tickets (1-20)',
    enterQuantity: 'Enter quantity',
    tickets: 'Tickets',
    pricePerTicket: 'Price per ticket',
    totalCost: 'Total Cost',
    selectPaymentSource: 'Select Payment Source',
    chooseWhichMXIBalance: 'Choose which MXI balance to use for this purchase',
    mxiPurchasedSource: 'MXI Purchased',
    mxiFromCommissionsSource: 'MXI from Commissions',
    mxiFromChallengesSource: 'MXI from Challenges',
    howItWorksBonus: 'How It Works',
    eachTicketCosts2MXI: 'Each ticket costs 2 MXI',
    buyBetween1And20TicketsPerRound: 'Buy between 1 and 20 tickets per round',
    roundLocksWhen1000TicketsSold: 'Round locks when 1000 tickets are sold',
    winnerReceives90Percent: 'Winner receives 90% of the total pool',
    winnerAnnouncedOnSocialMedia: 'Winner announced on social media',
    purchaseIsFinalNoRefunds: 'Purchase is final - no refunds',
    insufficientBalanceNeedForTickets: 'You need {{needed}} MXI to purchase {{quantity}} ticket(s).\n\nYour available balance for challenges is {{available}} MXI.\n\nAvailable MXI includes:\n- MXI purchased directly\n- MXI from unified commissions\n- MXI from challenge winnings',
    insufficientBalanceInSource: 'Your {{source}} balance ({{available}} MXI) is not enough to cover the cost ({{needed}} MXI).',
    successfullyPurchasedTickets: 'Successfully purchased {{count}} ticket(s) for {{cost}} MXI using {{source}}!',
    failedToPurchaseTickets: 'Failed to purchase tickets',
    
    // USDT Payment Page
    payInUSDT: 'Pay in USDT',
    selectPaymentNetwork: 'Select Payment Network',
    eachNetworkValidatesIndependently: 'Each network validates its transactions independently',
    networkDescription: '{{network}} Network - Independent validation',
    validationIn: 'Validation in {{network}}',
    paymentsOnlyValidatedOnNetwork: 'Payments on {{network}} are only validated on the {{network}} network',
    paymentInstructions: 'Payment Instructions',
    selectNetworkYouWillUse: 'Select the network you will use ({{label}})',
    sendUSDTFromAnyWallet: 'Send USDT from any wallet to the recipient address',
    minimumAmountLabel: 'Minimum amount: {{min}} USDT',
    copyTransactionHash: 'Copy the transaction hash (txHash)',
    pasteHashAndVerify: 'Paste the txHash here and verify the payment',
    youWillReceiveMXI: 'You will receive MXI = USDT × {{rate}}',
    recipientAddress: 'Recipient Address ({{label}})',
    addressCopied: 'Address copied to clipboard',
    onlySendUSDTOnNetwork: '⚠️ Only send USDT on the {{network}} network ({{label}})',
    mxiCalculator: 'MXI Calculator',
    transactionHashTxHash: 'Transaction Hash (txHash)',
    pasteYourTransactionHash: 'Paste your {{network}} transaction hash here',
    correctLength: '✓ Correct length',
    charactersCount: '⚠️ {{count}}/66 characters',
    verifyAutomatically: 'Verify Automatically',
    verifying: 'Verifying...',
    requestManualVerification: 'Request Manual Verification',
    sendingRequest: 'Sending request...',
    importantValidationByNetwork: '⚠️ Important - Validation by Network',
    eachNetworkValidatesIndependentlyInfo: 'Each network validates its transactions independently',
    paymentsOnETHOnlyValidatedOnETH: 'Payments on ETH are only validated on the Ethereum network',
    paymentsOnBNBOnlyValidatedOnBNB: 'Payments on BNB are only validated on the BNB Chain network',
    paymentsOnPolygonOnlyValidatedOnPolygon: 'Payments on Polygon are only validated on the Polygon network',
    ensureCorrectNetworkBeforeVerifying: 'Make sure to select the correct network before verifying',
    transactionMustHave3Confirmations: 'The transaction must have at least 3 confirmations',
    cannotUseSameHashTwice: '⚠️ YOU CANNOT USE THE SAME HASH TWICE - Anti-duplicate system active',
    ifAutomaticFailsUseManual: '📋 If automatic verification fails, use manual verification',
    pasteHashHere: 'Paste the hash here',
    hashInvalid: 'Invalid Hash',
    hashMustStartWith0x: 'The transaction hash must start with 0x and have 66 characters\n\nCurrent hash: {{count}} characters',
    confirmNetwork: '⚠️ Confirm Network',
    areYouSureTransactionOnNetwork: 'Are you sure the transaction was made on {{network}} ({{label}})?\n\nValidation will be done ONLY on this network.',
    yesVerify: 'Yes, verify',
    requestManualVerificationTitle: '📋 Request Manual Verification',
    doYouWantToSendManualRequest: 'Do you want to send a manual verification request to the administrator?\n\nNetwork: {{network}} ({{label}})\nHash: {{hash}}\n\nAn administrator will review your transaction and approve it manually. This process can take up to 2 hours.',
    sendRequest: 'Send Request',
    
    // Manual Verification
    manualVerification: 'Manual Verification',
    verificationOfNowPaymentsPayments: 'Verification of NowPayments Payments',
    viewHistoryAndRequestManualVerification: 'Here you can view the history of your payments made through NowPayments and request manual verification if a payment was not credited automatically.',
    noNowPaymentsRegistered: 'You have no NowPayments payments registered.',
    order: 'Order',
    paymentID: 'Payment ID',
    date: 'Date',
    manualVerificationRequested: '⏳ Manual verification requested. An administrator will review your payment soon.',
    administratorReviewingPayment: '👀 An administrator is reviewing your payment now.',
    administratorRequestsMoreInfo: '📋 The administrator requests more information',
    informationRequested: 'Information requested:',
    responseSent: '✅ Response sent. The administrator will review it soon.',
    respond: 'Respond',
    manualVerificationApproved: '✅ Manual verification approved',
    rejectedReason: '❌ Rejected: {{reason}}',
    noReason: 'No reason',
    paymentCreditedSuccessfully: '✅ Payment credited successfully',
    verificationOfUSDTPayments: 'Verification of USDT Payments',
    requestManualVerificationOfUSDT: 'Request manual verification of your direct USDT payments by entering the transaction hash. An administrator will review your payment and credit it manually.',
    usdtPaymentHistory: 'USDT Payment History',
    noUSDTPaymentsRegistered: 'You have no USDT payments registered.',
    network: 'Network',
    transactionHash: 'Transaction Hash',
    requestManualUSDTVerification: 'Request Manual USDT Verification',
    doYouWantToRequestManualVerification: 'Do you want to send a manual verification request to the administrator?\n\nNetwork: {{network}} ({{label}})\nHash: {{hash}}\n\nAn administrator will review your transaction and approve it manually. This process can take up to 2 hours.',
    requestSentSuccessfully: 'Request Sent Successfully',
    manualVerificationRequestSent: 'Your manual verification request has been sent successfully.\n\nOrder: {{order}}\nNetwork: {{network}}\nHash: {{hash}}\n\nAn administrator will review your transaction in the next 2 hours.\n\nYou can view the status of your request in the history section.',
    hashDuplicate: 'Hash Duplicate',
    hashAlreadyRegistered: 'This transaction hash has already been registered previously.\n\nOrder: {{order}}\nStatus: {{status}}\n\nYou cannot use the same transaction hash twice.',
    errorSendingRequest: 'Error sending request',
    couldNotSendVerificationRequest: 'Could not send the verification request.\n\nDetails: {{error}}\nCode: {{code}}\n\nPlease try again or contact support.',
    respondToAdministrator: 'Respond to Administrator',
    yourResponse: 'Your response:',
    writeYourResponseHere: 'Write your response here...',
    send: 'Send',
    responseSentToAdministrator: 'Your response has been sent to the administrator. You will receive a notification when your request is reviewed.',
    errorSendingResponse: 'Error sending response',
    nowPayments: 'NowPayments',
    directUSDT: 'Direct USDT',
    verificationOfNowPayments: 'Verification of NowPayments Payments',
    verificationOfUSDT: 'Verification of USDT Payments',
    requestManualVerificationNowPayments: '📋 Request Manual Verification',
    doYouWantToRequestNowPaymentsVerification: 'Do you want to request manual verification of this NowPayments payment?\n\nAmount: {{amount}} USDT\nMXI: {{mxi}} MXI\nOrder: {{order}}\n\nAn administrator will review your payment and approve it manually. This process can take up to 2 hours.',
    request: 'Request',
    requestSentMessage: 'Your manual verification request has been sent successfully.\n\nAn administrator will review your payment in the next 2 hours.\n\nYou will receive a notification when your payment is verified.',
    existingRequest: 'Existing Request',
    existingRequestMessage: 'A verification request already exists for this payment.\n\nStatus: {{status}}\n\nPlease wait for the administrator to review it.',
    
    // Transaction History Page
    transactionHistoryTitle: 'Transaction History',
    loadingHistory: 'Loading history...',
    successful: 'Successful',
    failed: 'Failed',
    noTransactions: 'No transactions',
    noTransactionsYet: 'You have not made any transactions yet',
    noPendingTransactions: 'No pending transactions',
    noSuccessfulTransactions: 'No successful transactions',
    noFailedTransactions: 'No failed transactions',
    purchaseMXINowPayments: 'Purchase MXI (NOWPayments)',
    purchaseMXIOKX: 'Purchase MXI (OKX)',
    manualPayment: 'Manual Payment',
    commission: 'Commission',
    completed: 'Completed',
    confirmed: 'Confirmed',
    waitingForPayment: 'Waiting for Payment',
    confirming: 'Confirming',
    expired: 'Expired',
    cancelled: 'Cancelled',
    walletAddress: 'Wallet Address',
    completedOn: 'Completed',
    noPaymentID: 'No Payment ID',
    paymentCreationFailed: 'This transaction does not have a valid payment ID. Payment creation likely failed.',
    cancelTransaction: 'Cancel Transaction',
    areYouSureCancelTransaction: 'Are you sure you want to cancel this pending transaction?',
    noCancelIt: 'No',
    yesCancelIt: 'Yes, Cancel',
    transactionCancelled: 'The transaction has been cancelled',
    couldNotCancelTransaction: 'Could not cancel the transaction',
    errorVerifying: 'Error Verifying',
    couldNotVerifyPaymentStatus: 'Could not verify payment status. Please try again.',
    viewDetails: 'View Details',
    errorDetails: 'Error Details',
    noDetailsAvailable: 'No details available',
    paymentConfirmed: 'Payment Confirmed',
    paymentConfirmedBalanceUpdated: 'Your payment has been confirmed. Your balance has been updated.',
    paymentFailed: 'Payment Failed',
    paymentFailedOrExpired: 'The payment has {{status}}. You can try creating a new order.',
    paymentStatus: 'Payment Status',
    currentStatus: 'Current status: {{status}}\n\nThe payment is still being processed.',
    couldNotVerifyStatus: 'Could not verify payment status',
    networkError: 'Network Error',
    couldNotConnectToServer: 'Could not connect to the server. Please check your internet connection and try again.',
    pay: 'Pay',
    verify: 'Verify',
    viewTechnicalDetails: 'View technical details',
    allTransactions: 'All',
    pendingTransactions: 'Pending',
    successfulTransactions: 'Successful',
    failedTransactions: 'Failed',
    
    // Withdrawals History
    withdrawalHistoryTitle: 'Withdrawal History',
    noWithdrawalsYet: 'No Withdrawals Yet',
    withdrawalHistoryWillAppear: 'Your withdrawal history will appear here once you make your first withdrawal.',
    processing: 'Processing',
    
    // Vesting
    vestingBalance: 'Vesting Balance',
    mxiVestingBalance: 'MXI Vesting Balance',
    loadingVestingData: 'Loading vesting data...',
    
    // Edit Profile
    enterYourFullName: 'Enter your full name',
    enterFullLegalName: 'Enter your full legal name as it appears on your ID',
    enterYourIDNumber: 'Enter your ID number',
    enterNationalID: 'Enter your national ID, passport, or driver\'s license number',
    residentialAddress: 'Residential Address',
    enterYourResidentialAddress: 'Enter your residential address',
    enterCompleteAddress: 'Enter your complete residential address',
    emailAddressReadOnly: 'Email Address (Read-only)',
    referralCodeReadOnly: 'Referral Code (Read-only)',
    saveChanges: 'Save Changes',
    profileLocked: 'Profile Locked',
    profileCannotBeEdited: 'Your profile cannot be edited because your KYC verification is {{status}}.',
    profileInfoCanOnlyBeModified: 'Profile information can only be modified before KYC verification is approved.',
    backToProfile: 'Back to Profile',
    importantNotice: 'Important Notice',
    canOnlyEditBeforeKYC: 'You can only edit your profile information before your KYC verification is approved. Make sure all information is accurate before submitting your KYC.',
    emailAndReferralCannotChange: 'Your email address and referral code cannot be changed. If you need to update these, please contact support.',
    profileUpdatedSuccessfully: 'Your profile has been updated successfully',
    failedToUpdateProfile: 'Failed to update profile. Please try again.',
    pleaseEnterFullName: 'Please enter your full name',
    pleaseEnterAddress: 'Please enter your address',
    pleaseEnterIDNumber: 'Please enter your ID number',
    idNumberAlreadyRegistered: 'This ID number is already registered to another account',
    
    // Terms
    viewTerms: 'View Terms and Conditions',
    acceptTerms: 'I have read and accept the',
    
    // Messages
    emailVerificationRequired: 'Email Verification Required',
    pleaseVerifyEmail: 'Please verify your email address before logging in. Check your inbox for the verification link.',
    resendEmail: 'Resend Email',
    accountCreatedSuccess: 'Account created successfully! Please check your email to verify your account.',
    loginSuccess: 'Login successful',
    loginError: 'Login Error',
    invalidCredentials: 'Invalid email or password. Please check your credentials and try again.',
    errorLoggingIn: 'Error logging in. Please try again.',
    
    // Errors
    fillAllFields: 'Please fill in all required fields',
    invalidEmail: 'Please enter a valid email address',
    passwordTooShort: 'Password must be at least 6 characters',
    passwordsDontMatch: 'Passwords do not match',
    
    // Info
    minimumInvestment: 'Minimum investment from 50 USDT',
    poolClosesOn: 'The Pre-Sale closes on February 15, 2026 at 12:00 UTC',
    
    // Admin
    adminPanel: 'Admin Panel',
    manageUsers: 'Manage users and system',
    
    // Stats
    memberSince: 'Member since',
    
    // Actions
    refresh: 'Refresh',
    updating: 'Updating...',
    
    // Conversion
    equivalent: 'Equivalent',
    
    // Time
    processingTime24to48: 'Processing time: 24-48 hours',
    
    // Important
    important: 'Important',
    note: 'Note',
    warning: 'Warning',
    
    // Calculator
    calculator: 'Calculator',
    
    // Profile Page - Additional
    updateYourInfo: 'Update your information',
    areYouSureLogout: 'Are you sure you want to log out?',
    
    // Support Page - Additional
    supportAndHelp: 'Support & Help',
    getAssistance: 'Get assistance from our team',
    newSupportRequestButton: 'New Support Request',
    categoryLabel: 'Category',
    generalCategory: 'General',
    kycCategory: 'KYC',
    withdrawalCategory: 'Withdrawal',
    transactionCategory: 'Transaction',
    technicalCategory: 'Technical',
    otherCategory: 'Other',
    subjectLabel: 'Subject',
    briefDescription: 'Brief description of your issue',
    messageLabel: 'Message',
    describeIssueInDetail: 'Describe your issue in detail...',
    sendMessageButton: 'Send Message',
    messageSentSuccess: 'Your message has been sent. Our support team will respond soon.',
    failedToSendMessageError: 'Failed to send message',
    noMessagesYetTitle: 'No messages yet',
    createSupportRequestMessage: 'Create a support request to get help from our team',
    messageDetailComingSoon: 'Message detail view coming soon',
    repliesCount: 'replies',
    pleaseEnterSubjectAndMessage: 'Please fill in all fields',
    
    // Contrataciones Page
    buyMXI: 'Buy MXI',
    diagnosticSystem: 'System Diagnostics',
    testServerConfiguration: 'Test Server Configuration',
    testingConfiguration: 'Testing configuration...',
    configurationCorrect: 'Configuration Correct',
    environmentVariablesConfigured: 'Environment variables are configured correctly. The payment system should work.',
    serverConfigurationError: 'Server Configuration Error',
    paymentSystemNotConfigured: 'The payment system is not configured correctly. This is a server issue that must be resolved by the administrator.',
    problemDetected: 'Problem Detected:',
    nowPaymentsCredentialsNotConfigured: 'NOWPayments credentials are not configured on the server',
    solutionForAdministrator: 'Solution (For Administrator):',
    goToSupabaseDashboard: '1. Go to Supabase Dashboard',
    navigateToProjectSettings: '2. Navigate to Project Settings → Edge Functions',
    addEnvironmentVariables: '3. Add the following environment variables:',
    redeployEdgeFunctions: '4. Redeploy Edge Functions',
    contactAdministrator: 'Please contact the system administrator to resolve this issue.',
    importantPaymentInfo: 'Important',
    paymentsProcessedInUSDT: 'Payments are processed with USDT on the Ethereum network (ERC20)',
    useCorrectNetwork: 'Make sure to use the correct network when paying',
    paymentExpiresIn1Hour: 'Payment expires in 1 hour',
    tokensAutomaticallyCredited: 'Tokens are automatically credited upon confirmation',
    currentPresalePhaseTitle: 'Current Presale Phase',
    activePhaseLabel: 'Active Phase',
    currentPriceLabel: 'Current Price',
    tokensSoldLabel: 'Tokens Sold',
    untilNextPhaseLabel: 'Until Next Phase',
    makePayment: 'Make Payment',
    amountInUSDT: 'Amount in USDT (min: 3, max: 500,000)',
    enterAmount: 'Enter amount',
    youWillReceive: 'You will receive:',
    payWithUSDTETH: 'Pay with USDT (ETH)',
    recentPayments: 'Recent Payments',
    amount: 'Amount',
    price: 'Price',
    status: 'Status',
    poolBenefits: 'Pool Benefits',
    receiveMXITokens: 'Receive MXI tokens for your participation',
    generateYield: 'Generate yields of 0.005% per hour',
    earnCommissions: 'Earn commissions from referrals (5%, 2%, 1%)',
    participateInLiquidityPool: 'Participate in the liquidity pool',
    earlyAccessToLaunch: 'Early access to official launch',
    preferentialPresalePrice: 'Preferential presale price (increases by phase)',
    errorModalTitle: 'Payment Error',
    errorMessage: 'Error Message:',
    errorCode: 'Error Code:',
    requestID: 'Request ID:',
    httpStatusCode: 'HTTP Status Code:',
    timestamp: 'Timestamp:',
    copyDetailsToConsole: 'Copy Details to Console',
    detailsCopied: 'Details Copied',
    errorDetailsCopiedToConsole: 'Error details have been copied to the console log',
    minimumAmountIs3USDT: 'Minimum amount is 3 USDT',
    maximumAmountIs500000USDT: 'Maximum amount is 500,000 USDT',
    paymentCreated: 'Payment Created',
    paymentPageOpened: 'The payment page has been opened. Complete the payment and return to the app to see the status.',
    paymentCompleted: 'Payment Completed!',
    youHaveReceived: 'You have received {{amount}} MXI tokens',
    paymentFailedTitle: 'Payment Failed',
    paymentCouldNotBeCompleted: 'The payment could not be completed. Please try again.',
    paymentExpired: 'Payment Expired',
    paymentTimeExpired: 'The time to complete the payment has expired. Please create a new payment.',
    ifExperiencingProblems: 'If you experience problems with payments, use this button to verify that environment variables are configured correctly.',
    
    // Additional hardcoded text found in files
    copied2: 'Copied',
    addressCopiedToClipboard: 'Address copied to clipboard',
    pleaseEnterTransactionHash: 'Please enter the transaction hash',
    invalidHash: 'Invalid Hash',
    confirmNetworkTitle: 'Confirm Network',
    areYouSureTransaction: 'Are you sure the transaction was made on {{network}} ({{label}})?\n\nValidation will be done ONLY on this network.',
    yesVerifyButton: 'Yes, verify',
    requestManualVerificationButton: 'Request Manual Verification',
    sendingRequestText: 'Sending request...',
    hashDuplicateTitle: 'Hash Duplicate',
    hashAlreadyRegisteredText: 'This transaction hash has already been registered previously.\n\nOrder: {{order}}\nStatus: {{status}}\n\nYou cannot use the same transaction hash twice.',
    requestSentSuccessfullyTitle: 'Request Sent Successfully',
    manualVerificationRequestSentText: 'Your manual verification request has been sent successfully.\n\nOrder: {{order}}\nNetwork: {{network}}\nHash: {{hash}}\n\nAn administrator will review your transaction in the next 2 hours.\n\nYou can view the status of your request in the history section.',
    errorSendingRequestTitle: 'Error Sending Request',
    couldNotSendVerificationRequestText: 'Could not send the verification request.\n\nDetails: {{error}}\nCode: {{code}}\n\nPlease try again or contact support.',
    paymentConfirmedTitle: 'Payment Confirmed',
    paymentConfirmedText: '{{amount}} MXI have been credited to your account.\n\nNetwork: {{network}}\nUSDT paid: {{usdt}}',
    viewBalance: 'View Balance',
    verificationError: 'Verification Error',
    transactionNotFound: 'Transaction Not Found',
    transactionNotFoundText: 'The transaction was not found on {{network}}.\n\n📋 Steps to solve:\n\n1. Verify that the hash is correct\n2. Make sure the transaction is on the {{network}} network\n3. Wait for the transaction to have at least 1 confirmation\n4. Verify on a block explorer:\n   • Ethereum: etherscan.io\n   • BNB Chain: bscscan.com\n   • Polygon: polygonscan.com',
    waitingConfirmations: 'Waiting Confirmations',
    waitingConfirmationsText: 'The transaction needs more confirmations.\n\n{{message}}\n\nCurrent confirmations: {{confirmations}}\nRequired confirmations: {{required}}\n\n⏰ Please wait a few minutes and try again.',
    insufficientAmountTitle: 'Insufficient Amount',
    insufficientAmountText: 'The minimum amount is {{min}} USDT.\n\n{{message}}\n\nAmount received: {{usdt}} USDT\nMinimum amount: {{minimum}} USDT',
    alreadyProcessed: 'Already Processed',
    alreadyProcessedText: 'This transaction has already been processed previously.\n\nIf you believe this is an error, contact support.',
    invalidTransfer: 'Invalid Transfer',
    invalidTransferText: 'No valid USDT transfer was found to the recipient address.\n\n📋 Verify:\n\n1. That you sent USDT (not another token)\n2. That the recipient address is correct:\n   {{address}}\n3. That the transaction is on {{network}}',
    transactionFailed: 'Transaction Failed',
    transactionFailedText: 'The transaction failed on the blockchain.\n\nVerify the transaction status on a block explorer.',
    invalidNetworkTitle: 'Invalid Network',
    invalidNetworkText: 'Invalid network selected.\n\nSelect one of the available networks: Ethereum, BNB Chain or Polygon.',
    configurationError: 'Configuration Error',
    configurationErrorText: 'Server configuration error.\n\n{{message}}\n\n⚠️ Contact the system administrator.',
    incorrectNetwork: 'Incorrect Network',
    incorrectNetworkText: 'The RPC is connected to the incorrect network.\n\nContact the system administrator.',
    authenticationError: 'Authentication Error',
    authenticationErrorText: 'Your session has expired.\n\nPlease log out and log in again.',
    incompleteData: 'Incomplete Data',
    incompleteDataText: 'Required data is missing.\n\nMake sure to enter the transaction hash.',
    databaseError: 'Database Error',
    databaseErrorText: 'Error processing the transaction.\n\n{{message}}\n\nPlease try again or contact support.',
    rpcConnectionError: 'RPC Connection Error',
    rpcConnectionErrorText: 'Could not connect to the blockchain node.\n\n{{message}}\n\nPlease try again in a few minutes.',
    internalError: 'Internal Error',
    internalErrorText: 'Internal server error.\n\n{{message}}\n\nPlease try again or contact support.',
    unknownError: 'Unknown Error',
    unknownErrorText: 'Error verifying payment.\n\nPlease try again or contact support.',
    connectionError: 'Connection Error',
    connectionErrorText: 'Could not connect to the server.\n\nTechnical details:\n{{message}}\n\n📋 Steps to solve:\n\n1. Verify your internet connection\n2. Try again in a few seconds\n3. If the problem persists, contact support',
    pasteHashHereText: 'Paste the hash here',
    loadingUserData: 'Loading user data...',
    loadingKYCData: 'Loading KYC data...',
    successUploadDocument: 'Success',
    frontDocumentUploaded: 'Front document uploaded successfully!',
    backDocumentUploaded: 'Back document uploaded successfully!',
    uploadError: 'Upload Error',
    errorUploadingDocument: 'Error uploading document. Please try again.',
    pleaseEnterFullNameText: 'Please enter your full name',
    pleaseEnterDocumentNumber: 'Please enter your document number',
    pleaseUploadFrontDocument: 'Please upload the front of your ID document',
    pleaseUploadBackDocument: 'Please upload the back of your ID document',
    idCard: 'ID Card',
    passportDoc: 'Passport',
    driversLicenseDoc: 'Driver\'s License',
    withdrawalHistoryTitle2: 'Withdrawal History',
    processing2: 'Processing',
    loadingVestingDataText: 'Loading vesting data...',
    errorLoadingVestingData: 'Error loading vesting data',
    couldNotLoadVestingInfo: 'Could not load vesting information',
    vestingSourceTitle: 'Vesting Source',
    vestingSourceDescriptionText: 'Vesting is generated ONLY from MXI purchased directly with USDT. Commissions DO NOT generate vesting. This chart represents the user\'s personal growth in MXI: purchases, expenses, losses, etc.',
    mxiPurchasedVestingBaseText: 'MXI Purchased (Vesting Base)',
    mxiInVestingText: 'MXI in Vesting',
    availableForWithdrawalText: 'Available for withdrawal once the coin is launched',
    blockedUntilLaunchText: 'Blocked until official launch',
    daysRemainingText: 'days',
    balanceBlockedTitle: 'Balance Blocked',
    balanceBlockedDescriptionText: 'The vesting balance cannot be unified or withdrawn until the coin is officially launched. Once launched, you can withdraw your balance by meeting the withdrawal requirements (5 active referrals and approved KYC).',
    timeUntilLaunchText: 'Time until launch:',
    releasedText: 'Released',
    releasePercentageText: 'Release percentage:',
    releasesCompletedText: 'Releases completed:',
    nextReleaseText: 'Next release:',
    withdrawalStatusText: 'Withdrawal status:',
    enabledText: 'Enabled',
    blockedUntilLaunchShortText: 'Blocked until launch',
    whatIsVestingText: 'What is Vesting?',
    vestingDescriptionText: 'Vesting is a mechanism that gradually releases your MXI tokens obtained through yield/return on purchased MXI. This ensures market stability and protects the coin\'s value.',
    vestingReleaseInfoText: 'Every 10 days, {{percentage}}% of your vesting balance is released, which you can withdraw once you meet the requirements (5 active referrals and approved KYC).',
    vestingReleaseInfoPreLaunchText: 'Once the coin is launched, every 10 days {{percentage}}% of your vesting balance will be released for withdrawal.',
    vestingImportantNoteText: '⚠️ Important: Only MXI purchased directly generates vesting yield. Commissions DO NOT generate vesting. The "MXI Balance" chart shows your personal growth in MXI, not the vesting itself.',
    withdrawMXIText: 'Withdraw MXI',
    withdrawVestingBalanceText: 'Withdraw your released vesting balance',
    vestingInformationText: 'Vesting Information',
    everyTenDaysText: 'every 10 days',
    bonusParticipation: 'Participation Bonus',
    loadingBonusText: 'Loading bonus...',
    noActiveBonusRoundText: 'No active bonus round',
    retryButton: 'Retry',
    roundText: 'Round',
    openText: 'Open',
    lockedText: 'Locked',
    prizePoolText: 'Prize Pool (90%)',
    totalPoolText: 'Total Pool',
    ticketsSoldText: 'Tickets Sold',
    ticketPriceText: 'Ticket Price',
    yourTicketsText: 'Your Tickets',
    availableMXIText: 'Available MXI',
    purchaseTicketsText: 'Purchase Tickets',
    buyBetween1And20TicketsText: 'Buy between 1 and 20 tickets. Maximum 20 tickets per user per round.',
    buyTicketsText: 'Buy Tickets',
    numberOfTicketsText: 'Number of Tickets (1-20)',
    enterQuantityText: 'Enter quantity',
    ticketsText: 'Tickets',
    pricePerTicketText: 'Price per ticket',
    totalCostText: 'Total Cost',
    selectPaymentSourceText: 'Select Payment Source',
    chooseWhichMXIBalanceText: 'Choose which MXI balance to use for this purchase',
    mxiPurchasedSourceText: 'MXI Purchased',
    mxiFromCommissionsSourceText: 'MXI from Commissions',
    mxiFromChallengesSourceText: 'MXI from Challenges',
    howItWorksBonusText: 'How It Works',
    eachTicketCosts2MXIText: 'Each ticket costs 2 MXI',
    buyBetween1And20TicketsPerRoundText: 'Buy between 1 and 20 tickets per round',
    roundLocksWhen1000TicketsSoldText: 'Round locks when 1000 tickets are sold',
    winnerReceives90PercentText: 'Winner receives 90% of the total pool',
    winnerAnnouncedOnSocialMediaText: 'Winner announced on social media',
    purchaseIsFinalNoRefundsText: 'Purchase is final - no refunds',
    insufficientBalanceNeedForTicketsText: 'You need {{needed}} MXI to purchase {{quantity}} ticket(s).\n\nYour available balance for challenges is {{available}} MXI.\n\nAvailable MXI includes:\n- MXI purchased directly\n- MXI from unified commissions\n- MXI from challenge winnings',
    insufficientBalanceInSourceText: 'Your {{source}} balance ({{available}} MXI) is not enough to cover the cost ({{needed}} MXI).',
    successfullyPurchasedTicketsText: 'Successfully purchased {{count}} ticket(s) for {{cost}} MXI using {{source}}!',
    failedToPurchaseTicketsText: 'Failed to purchase tickets',
    pleaseEnterValidQuantity: 'Please enter a valid quantity between 1 and 20',
    continueButton: 'Continue',
    cancelButton: 'Cancel',
    successTitle: 'Success!',
    errorTitle: 'Error',
    withdrawalHistoryTitle3: 'Withdrawal History',
    noWithdrawalsYetText: 'No Withdrawals Yet',
    withdrawalHistoryWillAppearText: 'Your withdrawal history will appear here once you make your first withdrawal.',
    walletAddressText: 'Wallet Address:',
    completedText: 'Completed:',
    supportAndHelpText: 'Support & Help',
    getAssistanceText: 'Get assistance from our team',
    newSupportRequestButtonText: 'New Support Request',
    categoryLabelText: 'Category',
    generalCategoryText: 'General',
    kycCategoryText: 'KYC',
    withdrawalCategoryText: 'Withdrawal',
    transactionCategoryText: 'Transaction',
    technicalCategoryText: 'Technical',
    otherCategoryText: 'Other',
    subjectLabelText: 'Subject',
    briefDescriptionText: 'Brief description of your issue',
    messageLabelText: 'Message',
    describeIssueInDetailText: 'Describe your issue in detail...',
    sendMessageButtonText: 'Send Message',
    messageSentSuccessText: 'Your message has been sent. Our support team will respond soon.',
    failedToSendMessageErrorText: 'Failed to send message',
    noMessagesYetTitleText: 'No messages yet',
    createSupportRequestMessageText: 'Create a support request to get help from our team',
    messageDetailComingSoonText: 'Message detail view coming soon',
    repliesCountText: 'replies',
    pleaseEnterSubjectAndMessageText: 'Please fill in all fields',
    challengeHistoryText: 'Challenge History',
    viewGameRecordsText: 'View game records',
    allText: 'All',
    winsText: 'Wins',
    lossesText: 'Losses',
    noHistoryYetText: 'No History Yet',
    challengeHistoryWillAppearText: 'Your challenge history will appear here once you participate in games',
    scoreText: 'Score',
    rankText: 'Rank',
    wonText: 'Won',
    lostText: 'Lost',
    expiresInText: 'Expires in',
    tournamentWinningsText: 'Tournament Winnings',
    totalWonText: 'Total Won',
    withdrawToMXIBalanceText: 'Withdraw to MXI Balance',
    transferWinningsToMainBalanceText: 'Transfer your winnings to your main MXI balance to use them for purchases and other functions.',
    amountToWithdrawMXIText: 'Amount to Withdraw (MXI)',
    minimum50MXIRequiredText: 'Minimum 50 MXI',
    invalidAmountEnterValidText: 'Invalid Amount. Please enter a valid amount',
    minimumWithdrawalIs50Text: 'The minimum withdrawal is 50 MXI',
    insufficientBalanceOnlyHaveText: 'You only have {{available}} MXI available from tournament winnings',
    requirementsNotMetNeed5ReferralsText: 'You need 5 active referrals who have purchased the minimum MXI.\n\nCurrently you have: {{count}} active referrals',
    confirmWithdrawalToMXIBalanceText: 'Confirm Withdrawal to MXI Balance',
    doYouWantToTransferFromWinningsText: 'Do you want to transfer {{amount}} MXI from tournament winnings to your main balance?\n\nThis will allow you to use these MXI for purchases and other functions.',
    withdrawalSuccessfulTransferredText: '{{amount}} MXI have been transferred to your main balance',
    confirmText: 'Confirm',
    requirementsTitleText: 'Requirements:',
    activeReferralsText: 'active referrals',
    minimumText: 'Minimum',
    availableText2: 'Available',
    editProfileText: 'Edit Profile',
    personalInformationText: 'Personal Information',
    fullNameText: 'Full Name',
    enterYourFullNameText: 'Enter your full name',
    enterFullLegalNameText: 'Enter your full legal name as it appears on your ID',
    idNumberText: 'ID Number',
    enterYourIDNumberText: 'Enter your ID number',
    enterNationalIDText: 'Enter your national ID, passport, or driver\'s license number',
    residentialAddressText: 'Residential Address',
    enterYourResidentialAddressText: 'Enter your residential address',
    enterCompleteAddressText: 'Enter your complete residential address',
    emailAddressReadOnlyText: 'Email Address (Read-only)',
    referralCodeReadOnlyText: 'Referral Code (Read-only)',
    saveChangesText: 'Save Changes',
    profileLockedText: 'Profile Locked',
    profileCannotBeEditedText: 'Your profile cannot be edited because your KYC verification is {{status}}.',
    profileInfoCanOnlyBeModifiedText: 'Profile information can only be modified before KYC verification is approved.',
    backToProfileText: 'Back to Profile',
    importantNoticeText: 'Important Notice',
    canOnlyEditBeforeKYCText: 'You can only edit your profile information before your KYC verification is approved. Make sure all information is accurate before submitting your KYC.',
    emailAndReferralCannotChangeText: 'Your email address and referral code cannot be changed. If you need to update these, please contact support.',
    profileUpdatedSuccessfullyText: 'Your profile has been updated successfully',
    failedToUpdateProfileText: 'Failed to update profile. Please try again.',
    pleaseEnterFullNameText2: 'Please enter your full name',
    pleaseEnterAddressText: 'Please enter your address',
    pleaseEnterIDNumberText: 'Please enter your ID number',
    idNumberAlreadyRegisteredText: 'This ID number is already registered to another account',
    successText2: 'Success',
    errorText2: 'Error',
  },
  es: {
    // Common
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    error: 'Error',
    success: 'Éxito',
    close: 'Cerrar',
    ok: 'OK',
    yes: 'Sí',
    no: 'No',
    back: 'Atrás',
    next: 'Siguiente',
    done: 'Hecho',
    edit: 'Editar',
    delete: 'Eliminar',
    view: 'Ver',
    share: 'Compartir',
    copy: 'Copiar',
    copied: '¡Copiado!',
    or: 'o',
    total: 'Total',
    continue: 'Continuar',
    
    // Auth
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    logout: 'Cerrar Sesión',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    name: 'Nombre Completo',
    idNumber: 'Número de Identificación',
    address: 'Dirección',
    referralCode: 'Código de Referido (Opcional)',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    dontHaveAccount: '¿No tienes una cuenta?',
    signIn: 'Iniciar Sesión',
    signUp: 'Registrarse',
    createAccount: 'Crear Cuenta',
    forgotPassword: '¿Olvidaste tu contraseña?',
    rememberPassword: 'Recordar contraseña',
    enterYourEmail: 'tu@email.com',
    enterYourPassword: 'Ingresa tu contraseña',
    
    // App Layout - NEW
    offlineTitle: '🔌 Estás desconectado',
    offlineMessage: '¡Puedes seguir usando la app! Tus cambios se guardarán localmente y se sincronizarán cuando vuelvas a estar en línea.',
    standardModalTitle: 'Modal Estándar',
    formSheetModalTitle: 'Hoja de Formulario Modal',
    
    // Tabs - NEW
    tabHome: 'Inicio',
    tabProfile: 'Perfil',
    tabDeposit: 'Depositar',
    tabWithdraw: 'Retirar',
    tabReferrals: 'Referidos',
    tabTournaments: 'Torneos',
    tabRewards: 'Recompensas',
    tabEcosystem: 'Ecosistema',
    
    // Login Page
    mxiStrategicPresale: 'MXI Strategic PreSale',
    secureYourPosition: 'Asegura Tu Posición en el Futuro',
    emailLabel: 'Correo Electrónico',
    passwordLabel: 'Contraseña',
    loginButton: 'Iniciar Sesión',
    recoverPassword: 'Recuperar Contraseña',
    contactSupport: 'Contactar Soporte',
    sendEmailTo: 'Envía un correo a:',
    pleaseVerifyEmailBeforeLogin: 'Por favor verifica tu email antes de iniciar sesión.',
    resendEmailButton: 'Reenviar Email',
    emailVerificationSent: 'Email de verificación enviado. Por favor revisa tu bandeja de entrada.',
    errorResendingEmail: 'Error al reenviar el email de verificación',
    recoverPasswordTitle: 'Recuperar Contraseña',
    recoverPasswordMessage: 'Por favor contacta al soporte técnico para recuperar tu contraseña.',
    supportEmail: 'support@mxi-strategic.com',
    presaleClosesOn: 'La Pre-Venta cierra el 15 de febrero de 2026 a las 12:00 UTC',
    
    // Register Page
    joinMXIStrategicPresale: 'Únete a MXI Strategic PreSale',
    fullName: 'Nombre Completo',
    minimumSixCharacters: 'Mínimo 6 caracteres',
    reEnterPassword: 'Vuelve a ingresar la contraseña',
    enterReferralCode: 'Ingresa el código de referido',
    onlyOneAccountPerPerson: 'Solo se permite una cuenta por persona. Tu número de identificación será verificado.',
    iHaveReadAndAccept: 'He leído y acepto los',
    termsAndConditions: 'Términos y Condiciones',
    alreadyHaveAccountLogin: '¿Ya tienes una cuenta?',
    termsAndConditionsRequired: 'Términos y Condiciones Requeridos',
    youMustAcceptTerms: 'Debes aceptar los Términos y Condiciones para crear una cuenta',
    accountCreatedSuccessfully: '¡Cuenta creada exitosamente! Por favor revisa tu correo para verificar tu cuenta antes de iniciar sesión.',
    failedToCreateAccount: 'Error al crear la cuenta. Por favor intenta nuevamente.',
    acceptTermsButton: 'Aceptar Términos',
    
    // Terms and Conditions Content
    termsContent: `TÉRMINOS Y CONDICIONES DE USO

MXI STRATEGIC PRESALE – APP VERSION

MAXCOIN (MXI) is a registered trademark of MXI Strategic Holdings Ltd., Cayman Islands.
App operated by MXI Technologies Inc. (Panamá).
Last update: 15/01/2026 – Version 1.0

1. Aceptación

Al crear una cuenta o utilizar la aplicación MXI Strategic Presale (la "App"), usted acepta estos Términos y Condiciones.
Si no está de acuerdo con ellos, no debe usar la App.

2. Sobre MXI

MXI Strategic Holdings Ltd. (Cayman) es la entidad propietaria del token MXI, la marca y la propiedad intelectual.

MXI Technologies Inc. (Panamá) es la empresa operadora de la App y responsable de su funcionamiento.

3. Función de la App

La App permite:

- Registrar usuarios
- Comprar tokens MXI con USDT (vía Binance)
- Acceder a un sistema de referidos
- Ver saldos, rendimientos y movimientos
- Solicitar retiros de comisiones y/o MXI según las reglas vigentes

4. Elegibilidad

Para usar la App, usted debe:

- Ser mayor de 18 años
- Tener capacidad legal para contratar
- Suministrar datos verídicos
- No vivir en países donde las criptomonedas estén prohibidas

5. Registro y Cuenta

- Solo se permite una cuenta por persona
- Es obligatorio completar KYC para habilitar retiros
- La información registrada debe coincidir con documentos oficiales
- Los números de identificación no pueden repetirse

6. Compra de Tokens MXI

- Mínimo de compra: 50 USDT
- Máximo por usuario: 100.000 USDT
- Pago exclusivamente en USDT a través de Binance
- El número de tokens recibidos depende de la fase de la preventa

7. Sistema de Referidos

Estructura de comisiones:

- Nivel 1: 5%
- Nivel 2: 2%
- Nivel 3: 1%

Requisitos para retirar comisiones:

- 5 referidos activos
- 10 días desde registro
- KYC aprobado
- Cada referido debe haber hecho al menos una compra

8. Rendimientos y Vesting

- Rendimiento: 0,005% por hora
- Comisiones unificadas también generan rendimiento
- Rendimientos no aumentan el vesting
- Se requieren 10 referidos activos para unificar el vesting al saldo principal

9. Retiros

9.1 Retiros de comisiones (USDT)

Requisitos:

- 5 referidos activos
- 10 días de membresía
- KYC aprobado
- Wallet USDT válida

9.2 Retiros de MXI

Requisitos:

- 5 referidos activos
- KYC aprobado

Liberación por fases si el monto excede 50000 usdt:

- 10% inicial
- +10% cada 7 días

10. KYC Obligatorio

Se solicitará:

- Documento oficial válido
- Fotografías
- Selfie (prueba de vida)
- Información verificable

11. Riesgos

Invertir en criptomonedas implica riesgos:

- Volatilidad extrema
- Pérdida total o parcial del capital
- Cambios regulatorios
- Riesgos tecnológicos y de ciberseguridad

MXI Strategic no garantiza ganancias ni retornos fijos.

12. Conductas Prohibidas

No se permite:

- Crear múltiples cuentas
- Proveer datos falsos
- Manipular referidos
- Usar la App para actividades ilícitas
- Procesar lavado de dinero

13. Limitación de Responsabilidad

La App se ofrece "tal cual".
Ni MXI Strategic Holdings Ltd. ni MXI Technologies Inc. son responsables por:

- Pérdidas económicas
- Errores de terceros o blockchain
- Daños indirectos o incidentales
- Uso indebido de la App

14. Aceptación Final

Al registrarse, usted declara que:

- Leyó y entiende estos Términos
- Acepta los riesgos
- Proporciona información veraz
- Cumple con las leyes de su país

15. POLÍTICA DE USO DEL TOKEN MXI

El token MXI es un activo digital en etapa de prelanzamiento, sin valor comercial, sin cotización pública y sin reconocimiento como moneda de curso legal en Colombia, España, México ni en ninguna otra jurisdicción. Su uso dentro de la plataforma es exclusivamente funcional, destinado a recompensas internas, participación en actividades gamificadas y acceso a beneficios del ecosistema MXI.

MXI no representa inversiones, derechos de propiedad, rentabilidad garantizada, participación accionaria, instrumentos financieros, valores negociables ni productos similares. Los usuarios aceptan que el uso del token es experimental, sujeto a cambios y dependiente de procesos de validación técnica y regulatoria.

Cualquier futuro valor, convertibilidad o listado del token dependerá de condiciones externas a la compañía, procesos regulatorios y decisiones de mercado que no pueden garantizarse. La plataforma no asegura beneficios económicos, apreciación ni rendimiento alguno asociado al MXI.

16. ANEXO LEGAL – JUEGOS Y RECOMPENSAS MXI

Las dinámicas disponibles dentro de la plataforma (incluyendo retos, minijuegos como tap, clicker, "AirBall", desafíos de habilidad y la modalidad "Bonus MXI") se basan exclusivamente en la destreza, rapidez, precisión o participación activa del usuario, y no dependen del azar para determinar resultados.

Ninguna actividad ofrecida debe interpretarse como:

- juego de azar,
- apuesta,
- sorteo con fines lucrativos,
- rifas reguladas,
- loterías estatales o privadas,
- ni mecanismos equivalentes regulados en Colombia, España o México.

El acceso a estas dinámicas puede requerir un pago simbólico en MXI, pero dicho pago no constituye una apuesta, ya que el token no posee valor económico real y se utiliza únicamente como mecanismo interno de participación.

La modalidad "Bonus MXI", incluyendo asignación aleatoria de premios, se realiza fuera de la plataforma principal, mediante procesos independientes, transparentes y verificables, cuyo fin es distribuir recompensas promocionales en MXI sin que ello constituya un juego de azar regulado.

Los usuarios aceptan que las recompensas otorgadas son promocionales, digitales y sin valor comercial, y que la participación en cualquier dinámica no garantiza ganancias económicas reales.

---

**IMPORTANTE**: Estos términos y condiciones son legalmente vinculantes. Si no está de acuerdo con alguna parte, no debe utilizar la Aplicación. Se recomienda consultar con un asesor legal o financiero antes de realizar inversiones en criptomonedas.

**Fecha de vigencia**: 15 de Enero de 2026
**Versión**: 1.0`,
    
    // Home
    hello: 'Hola',
    welcomeToMXI: 'Bienvenido a MXI Pool',
    phasesAndProgress: '🚀 Fases y Progreso',
    currentPhase: 'Fase Actual',
    phase: 'Fase',
    sold: 'Vendidos',
    remaining: 'Restantes',
    generalProgress: '📈 Progreso General',
    of: 'de',
    totalMXIDelivered: '💰 Total MXI Entregados',
    mxiDeliveredToAllUsers: 'MXI entregados a todos los usuarios (compras + comisiones + desafíos + vesting)',
    poolClose: 'Cierre del Pool',
    perMXI: 'por MXI',
    
    // Launch Countdown
    officialLaunch: 'LANZAMIENTO OFICIAL',
    maxcoinMXI: 'Maxcoin (MXI)',
    poolActive: 'Pool Activo',
    vestingRealTime: 'Vesting Tiempo Real',
    days: 'DÍAS',
    hours: 'HRS',
    minutes: 'MIN',
    seconds: 'SEG',
    launchDate: '15 Feb 2026 • 12:00 UTC',
    
    // Total MXI Balance Chart
    totalMXIBalance: '📊 Balance General de MXI',
    allSourcesIncluded: 'Todas las fuentes incluidas',
    chartShowsTotalBalance: 'Este gráfico muestra tu balance TOTAL de MXI incluyendo: compras directas, comisiones, torneos y vesting. El vesting se genera ÚNICAMENTE de los MXI comprados directamente.',
    generatingChartData: 'Generando datos del gráfico...',
    loadingChart: 'Cargando gráfico...',
    mxiTotal: 'MXI Total',
    purchased: 'Comprados',
    commissions: 'Comisiones',
    tournaments: 'Torneos',
    vesting: 'Vesting',
    completeBreakdown: '📊 Desglose Completo de MXI',
    mxiPurchased: 'MXI Comprados',
    mxiCommissions: 'MXI Comisiones',
    mxiTournaments: 'MXI Torneos',
    vestingRealTimeLabel: 'Vesting (Tiempo Real)',
    updatingEverySecond: 'Actualizando cada segundo',
    
    // Yield Display
    vestingMXI: '🔥 Vesting MXI (Minería Activa)',
    generatingPerSecond: '⚡ Generando {{rate}} MXI por segundo',
    mxiPurchasedVestingBase: '🛒 MXI Comprados (Base de Vesting)',
    onlyPurchasedMXIGeneratesVesting: 'ℹ️ Solo el MXI comprado genera rendimiento de vesting',
    currentSession: '💰 Sesión Actual',
    totalAccumulated: '📊 Total Acumulado',
    perSecond: 'Por Segundo',
    perMinute: 'Por Minuto',
    perHour: 'Por Hora',
    dailyYield: '📈 Rendimiento Diario',
    claimYield: '💎 Reclamar Rendimiento',
    claiming: 'Reclamando...',
    yieldInfo: 'Tasa de minería: 0.005% por hora de tu MXI comprado. Solo el MXI comprado directamente genera rendimiento de vesting. Las comisiones NO generan vesting. Para reclamar tu MXI minado, necesitas 5 referidos activos, 10 días de membresía y aprobación KYC. Recordar que para vesting se deben tener 10 referidos activos y se desbloqueará una vez se lance el token y se liste en los exchanges.',
    noYield: 'Sin Rendimiento',
    needMoreYield: 'Necesitas acumular más rendimiento antes de reclamar.',
    requirementsNotMet: 'Requisitos No Cumplidos',
    claimRequirements: 'Para reclamar tu MXI minado, necesitas:\n\n- 5 referidos activos (tienes {{count}})\n- 10 días de membresía\n- Verificación KYC aprobada\n\nUna vez cumplas estos requisitos, podrás reclamar tu rendimiento acumulado.',
    kycRequired: 'KYC Requerido',
    kycRequiredMessage: 'Necesitas completar la verificación KYC antes de reclamar tu MXI minado. Por favor ve a la sección KYC para verificar tu identidad.',
    yieldClaimed: '¡Rendimiento Reclamado!',
    yieldClaimedMessage: '¡Has reclamado exitosamente {{amount}} MXI y se ha agregado a tu balance de vesting!',
    claimFailed: 'Reclamo Fallido',
    
    // Deposit Page
    deposit: 'Depositar',
    buyMXIWithMultipleOptions: 'Compra MXI con múltiples opciones de pago',
    currentBalance: 'Balance Actual',
    usdtContributed: 'USDT Contribuido',
    currentPresalePhase: '🚀 Fase Actual de Preventa',
    activePhase: 'Fase Activa',
    phaseOf: 'Fase {{current}} de {{total}}',
    currentPrice: 'Precio Actual',
    tokensSold: 'Tokens Vendidos',
    untilNextPhase: 'Hasta Siguiente Fase',
    paymentOptions: '💳 Opciones de Pago',
    chooseYourPreferredPaymentMethod: 'Elige tu método de pago preferido',
    multiCryptoPayment: 'Pago Multi-Cripto',
    availableCryptocurrencies: '+50 Criptomonedas Disponibles',
    bitcoinEthereumUSDTUSDC: 'Bitcoin, Ethereum, USDT, USDC',
    multipleNetworks: 'Múltiples Redes (ETH, BSC, TRX, SOL)',
    automaticConfirmation: 'Confirmación Automática',
    directUSDTPayment: 'Pago Directo USDT',
    manualUSDTTransfer: 'Transferencia Manual de USDT',
    usdtOnMultipleNetworks: 'USDT en múltiples redes',
    manualVerificationAvailable: 'Verificación manual disponible',
    dedicatedSupport: 'Soporte dedicado',
    manualPaymentVerification: 'Verificación Manual de Pagos',
    requestManualVerificationOfPayments: 'Solicita verificación manual de tus pagos NowPayments y USDT',
    completePaymentHistory: 'Historial completo de pagos',
    verificationByAdministrator: 'Verificación por administrador',
    responseInLessThan2Hours: 'Respuesta en menos de 2 horas',
    transactionHistory: 'Historial de Transacciones',
    viewVerifyAndManageYourPayments: 'Ver, verificar y gestionar tus pagos',
    supportedCryptocurrencies: '🪙 Criptomonedas Soportadas',
    payWithAnyOfTheseCoinsAndMore: 'Paga con cualquiera de estas monedas y más',
    bitcoin: 'Bitcoin',
    ethereum: 'Ethereum',
    usdt: 'USDT',
    usdc: 'USDC',
    bnb: 'BNB',
    solana: 'Solana',
    litecoin: 'Litecoin',
    more50Plus: '+50 más',
    howItWorks: '📋 Cómo Funciona',
    chooseYourPaymentMethod: 'Elige tu Método de Pago',
    selectBetweenMultiCryptoOrDirectUSDT: 'Selecciona entre pago multi-cripto o transferencia directa USDT',
    enterTheAmount: 'Ingresa el Monto',
    specifyHowMuchUSDTYouWantToInvest: 'Especifica cuánto USDT deseas invertir (mínimo 2 USDT)',
    makeThePayment: 'Realiza el Pago',
    sendTheExactAmountToTheProvidedAddress: 'Envía la cantidad exacta a la dirección proporcionada',
    receiveYourMXI: 'Recibe tus MXI',
    tokensWillBeCreditedAutomatically: 'Los tokens se acreditarán automáticamente tras la confirmación',
    advantagesOfOurPaymentSystem: '✨ Ventajas de Nuestro Sistema de Pagos',
    automaticConfirmationInMinutes: 'Confirmación automática en minutos',
    secureAndVerifiedOnBlockchain: 'Seguro y verificado en blockchain',
    multiplePaymentOptionsAvailable: 'Múltiples opciones de pago disponibles',
    available247WithoutIntermediaries: 'Disponible 24/7 sin intermediarios',
    quickStats: 'Estadísticas Rápidas',
    paymentMethods: 'Métodos de Pago',
    cryptocurrencies: 'Criptomonedas',
    available247: 'Disponible 24/7',
    
    // Withdrawals Page
    withdrawals: 'Retiros',
    withdraw: 'Retirar',
    loadingData: 'Cargando datos...',
    updatingBalances: 'Actualizando balances...',
    mxiAvailable: 'MXI Disponibles',
    totalMXI: 'Total MXI',
    approximateUSDT: '≈ {{amount}} USDT',
    mxiPurchasedLabel: 'MXI Comprados',
    lockedUntilLaunch: '🔒 Bloqueado hasta lanzamiento',
    mxiCommissionsLabel: 'MXI Comisiones',
    availableLabel: '✅ Disponible',
    mxiVestingLabel: 'MXI Vesting',
    realTime: 'Tiempo Real',
    mxiTournamentsLabel: 'MXI Torneos',
    withdrawalType: 'Tipo de Retiro',
    withdrawMXIPurchased: 'Retirar MXI Comprados',
    mxiAcquiredThroughUSDTPurchases: 'MXI adquiridos mediante compras con USDT',
    withdrawMXICommissions: 'Retirar MXI Comisiones',
    mxiFromReferralCommissions: 'MXI de comisiones de referidos',
    withdrawMXIVesting: 'Retirar MXI Vesting',
    mxiGeneratedByYield: 'MXI generado por rendimiento (3% mensual)',
    withdrawMXITournaments: 'Retirar MXI Torneos',
    mxiWonInTournamentsAndChallenges: 'MXI ganado en torneos y desafíos',
    withdrawalDetails: 'Detalles del Retiro',
    withdrawalsInUSDTETH: '⚠️ Los retiros se realizan en USDT(ETH). Ingresa la cantidad en MXI.',
    amountMXI: 'Cantidad (MXI)',
    maximum: 'Máximo',
    walletAddressETH: 'Dirección de Billetera (ETH)',
    enterYourETHWalletAddress: 'Ingresa tu dirección de billetera ETH',
    requestWithdrawal: 'Solicitar Retiro',
    amountInMXI: 'Cantidad en MXI:',
    equivalentInUSDT: 'Equivalente en USDT:',
    rate: 'Tasa: 1 MXI = 0.4 USDT',
    withdrawalRequirements: '📋 Requisitos de Retiro',
    kycApproved: 'KYC Aprobado',
    activeReferralsForGeneralWithdrawals: '5 Referidos Activos para retiros generales ({{count}}/5)',
    activeReferralsForVestingWithdrawals: '10 Referidos Activos para retiros de Vesting ({{count}}/10)',
    mxiLaunchRequiredForPurchasedAndVesting: 'Lanzamiento de MXI requerido para retiros de MXI comprados y vesting',
    importantInformation: 'Información Importante',
    withdrawalsInUSDTETHInfo: '- Retiros en USDT(ETH): Todos los retiros se procesan en USDT en la red Ethereum',
    conversionInfo: '- Conversión: 1 MXI = 0.4 USDT',
    mxiCommissionsInfo: '- MXI Comisiones: Disponibles para retiro inmediato (requiere 5 referidos activos + KYC)',
    mxiTournamentsInfo: '- MXI Torneos: Disponibles para retiro de la misma forma que las comisiones',
    mxiVestingInfo: '- MXI Vesting: Requiere 10 referidos con compras de MXI + lanzamiento oficial',
    mxiPurchasedInfo: '- MXI Comprados: Bloqueados hasta el lanzamiento oficial de MXI',
    realTimeUpdateInfo: '- Actualización en Tiempo Real: Los balances de vesting se actualizan cada segundo',
    processingTime: '- Tiempo de procesamiento: 24-48 horas',
    verifyWalletAddress: '- Verifica cuidadosamente la dirección de billetera ETH',
    viewWithdrawalHistory: 'Ver Historial de Retiros',
    invalidAmount: 'Cantidad Inválida',
    pleaseEnterValidAmount: 'Por favor ingresa una cantidad válida',
    missingInformation: 'Información Faltante',
    pleaseEnterYourWalletAddress: 'Por favor ingresa tu dirección de billetera',
    insufficientBalance: 'Saldo Insuficiente',
    youDoNotHaveEnoughAvailable: 'No tienes suficiente {{type}} disponible',
    requirementNotMet: 'Requisito No Cumplido',
    youNeedAtLeast10ActiveReferrals: 'Necesitas al menos 10 referidos activos con compras de MXI para retirar Vesting.\n\nActualmente tienes: {{count}} referidos activos.',
    withdrawalNotAvailable: 'Retiro No Disponible',
    withdrawalsWillBeAvailableAfterLaunch: 'Los retiros de {{type}} estarán disponibles después del lanzamiento oficial de MXI.\n\nTiempo restante: {{days}} días',
    notEligible: 'No Elegible',
    youNeedAtLeast5ActiveReferrals: 'Necesitas al menos 5 referidos activos y KYC aprobado para retirar',
    confirmWithdrawal: 'Confirmar Retiro',
    youAreAboutToWithdraw: 'Vas a retirar:\n\n{{amount}} MXI ({{type}})\n≈ {{usdt}} USDT\n\nTasa de conversión: 1 MXI = 0.4 USDT\n\n¿Deseas continuar?',
    requestSent: 'Solicitud Enviada',
    yourWithdrawalRequestHasBeenSent: 'Tu solicitud de retiro ha sido enviada exitosamente:\n\n{{amount}} MXI ({{type}})\n≈ {{usdt}} USDT (ETH)\n\nSerá procesada en 24-48 horas.',
    withdrawalError: 'Error de Retiro',
    couldNotProcessWithdrawal: 'No se pudo procesar el retiro. Por favor intenta de nuevo.',
    errorProcessingWithdrawal: 'Ocurrió un error al procesar el retiro',
    withdrawalHistory: 'Historial de Retiros',
    
    // Referrals Page
    referrals: 'Referidos',
    myReferrals: 'Mis Referidos',
    referralSystem: 'Sistema de Referidos',
    yourReferralCode: 'Tu Código de Referido',
    shareCode: 'Compartir Código',
    commissionBalance: 'Balance de Comisiones (MXI)',
    totalEarned: 'Total Ganado',
    available: 'Disponible',
    level: 'Nivel',
    activeReferrals: 'Referidos Activos',
    howReferralsWork: 'Cómo Funcionan los Referidos',
    allCommissionsInMXI: 'Todas las comisiones se manejan internamente en MXI',
    withdrawToBalanceMXI: 'Retirar a Balance MXI',
    transferCommissionsDescription: 'Transfiere tus comisiones a tu balance principal de MXI para usarlas en compras y otras funciones.',
    withdrawToBalance: 'Retirar a Balance',
    amountToWithdraw: 'Monto a Retirar (MXI)',
    minimum50MXI: 'Mínimo 50 MXI',
    availableAmount: 'Disponible',
    requirements: 'Requisitos',
    activeReferralsRequired: 'referidos activos requeridos',
    minimumAmount: 'Mínimo',
    yourReferrals: 'Tus Referidos',
    activeReferralsLevel1: 'Referidos Activos (Nivel 1)',
    shareReferralCode: 'Comparte tu código de referido con amigos',
    earn5PercentLevel1: 'Gana 5% en MXI de referidos de Nivel 1',
    earn2PercentLevel2: 'Gana 2% en MXI de referidos de Nivel 2',
    earn1PercentLevel3: 'Gana 1% en MXI de referidos de Nivel 3',
    allCommissionsCreditedMXI: 'Todas las comisiones se acreditan directamente en MXI',
    need5ActiveReferrals: 'Necesitas 5 referidos activos de Nivel 1 para retirar',
    minimumWithdrawal: 'Retiro Mínimo',
    minimumWithdrawalIs50MXI: 'El retiro mínimo es de 50 MXI',
    youOnlyHaveAvailable: 'Solo tienes',
    availableFromCommissions: 'disponibles de comisiones',
    youNeed5ActiveReferrals: 'Necesitas 5 referidos activos que hayan comprado el mínimo de MXI.',
    currentlyYouHave: 'Actualmente tienes:',
    confirmWithdrawalToBalance: 'Confirmar Retiro a Balance MXI',
    doYouWantToTransfer: '¿Deseas transferir',
    fromCommissionsToMainBalance: 'de comisiones a tu balance principal?',
    thisWillAllowYouToUse: 'Esto te permitirá usar estos MXI para compras y otras funciones.',
    withdrawalSuccessful: 'Retiro Exitoso',
    transferredToMainBalance: 'se han transferido a tu balance principal',
    referralsText: 'referidos',
    couldNotCompleteWithdrawal: 'No se pudo completar el retiro',
    unexpectedError: 'Ocurrió un error inesperado',
    commissionsByReferrals: 'Comisiones por Referidos',
    totalEarnedByReferrals: 'Total Ganado por Referidos',
    howCommissionsWork: 'Cómo Funcionan las Comisiones',
    commissionsCalculatedOnMXI: 'Las comisiones se calculan sobre el monto en MXI comprado',
    commissionsAutomaticallyCredited: 'Las comisiones se acreditan automáticamente en MXI',
    requirementsToWithdraw: 'Requisitos para Retirar',
    
    // Tournaments Page
    tournamentsTitle: 'Torneos',
    availableGames: 'Juegos Disponibles',
    distributionOfRewards: 'Distribución de Recompensas',
    winner: 'Ganador',
    prizeFund: 'Fondo de Premios',
    onlyUseCommissionsOrChallenges: 'Solo puedes usar MXI de comisiones o retos ganados',
    players: 'Jugadores',
    joiningGame: 'Uniéndose al juego...',
    selectPlayers: 'Seleccionar Jugadores',
    asFirstPlayerChoosePlayers: 'Como primer jugador, elige cuántos jugadores participarán en este torneo:',
    createTournamentOf: 'Crear Torneo de {{count}} Jugadores',
    participateFor: '¿Participar por {{fee}} MXI?',
    prize: 'Premio',
    insufficientBalanceNeed: 'Necesitas {{needed}} MXI. Tienes {{available}} MXI disponible.',
    
    // Rewards Page
    rewards: 'Recompensas',
    earnMXIMultipleWays: 'Gana MXI de múltiples formas',
    loadingRewards: 'Cargando recompensas...',
    totalMXIEarned: 'Total MXI Ganado',
    bonus: 'Bonus',
    rewardPrograms: 'Programas de Recompensas',
    participationBonus: 'Bonus de Participación',
    participateInWeeklyDrawings: 'Participa en sorteos semanales y gana grandes premios',
    active: 'Activo',
    vestingAndYield: 'Vesting y Rendimiento',
    generatePassiveIncome: 'Genera rendimiento pasivo automáticamente',
    live: 'En Vivo',
    earnCommissionsFrom3Levels: 'Gana comisiones de 3 niveles por referir amigos',
    actives: 'activos',
    moreRewardsComingSoon: 'Más Recompensas Próximamente',
    workingOnNewRewards: 'Estamos trabajando en nuevos programas de recompensas emocionantes:',
    tournamentsAndCompetitions: 'Torneos y competencias',
    achievementBonuses: 'Bonos por logros',
    loyaltyRewards: 'Recompensas por fidelidad',
    specialEvents: 'Eventos especiales',
    benefitsOfRewards: 'Beneficios de las Recompensas',
    earnAdditionalMXI: 'Gana tokens MXI adicionales sin inversión extra',
    participateInExclusiveDrawings: 'Participa en sorteos exclusivos con grandes premios',
    generateAutomaticPassiveIncome: 'Genera rendimiento pasivo automático 24/7',
    bonusesForActiveReferrals: 'Bonos por referidos activos de hasta 3 niveles',
    rewardsForContinuedParticipation: 'Recompensas por participación continua',
    maximizeYourRewards: 'Maximiza tus Recompensas',
    keepAtLeast5ActiveReferrals: 'Mantén al menos 5 referidos activos para desbloquear retiros',
    participateRegularlyInBonus: 'Participa regularmente en el bonus de participación para aumentar tus chances',
    activateVestingForPassiveIncome: 'Activa el vesting para generar rendimiento pasivo continuo',
    shareYourReferralCodeSocial: 'Comparte tu código de referido en redes sociales',
    
    // Ecosystem Page
    ecosystem: '🌐 Ecosistema MXI',
    liquidityPool: 'Pool de Liquidez Maxcoin',
    whatIsMXI: '¿Qué es MXI? 💎',
    howItWorksTab: '¿Cómo funciona? 🚀',
    whyBuy: '¿Por qué comprar? 💰',
    meta: 'META 🎯',
    ecosystemTab: 'Ecosistema 🌱',
    quantumSecurity: 'Seguridad Cuántica 🔐',
    sustainability: 'Sostenibilidad ♻️',
    dailyVesting: 'Vesting Diario 💎',
    inPractice: 'En la práctica 📊',
    tokenomics: 'Tokenómica 🪙',
    
    // Profile Page
    profile: 'Perfil',
    editProfile: 'Editar Perfil',
    updateYourInformation: 'Actualiza tu información',
    completeYourIdentityVerification: 'Completa tu verificación de identidad',
    viewPreviousWithdrawals: 'Ver retiros anteriores',
    
    // Language
    language: 'Idioma',
    selectLanguage: 'Seleccionar Idioma',
    english: 'Inglés',
    spanish: 'Español',
    portuguese: 'Portugués',
    
    // KYC
    kycVerification: 'Verificación KYC',
    kycStatus: 'Estado KYC',
    approved: 'Aprobado',
    pending: 'Pendiente',
    rejected: 'Rechazado',
    notSubmitted: 'No Enviado',
    completeYourKYCVerification: 'Completa tu verificación de identidad',
    verificationStatus: 'Estado de Verificación',
    verifiedOn: 'Verificado el',
    yourKYCIsBeingReviewed: 'Tu verificación KYC está siendo revisada. Esto típicamente toma 24-48 horas.',
    rejectionReason: 'Razón de Rechazo',
    pleaseCorrectIssues: 'Por favor corrige los problemas mencionados y vuelve a enviar tu verificación.',
    whyKYCRequired: 'Por qué se requiere KYC:',
    kycMandatoryForWithdrawals: 'La verificación KYC es obligatoria para todos los retiros',
    helpPreventFraud: 'Ayuda a prevenir fraude y lavado de dinero',
    ensureCompliance: 'Asegura cumplimiento con regulaciones financieras',
    protectYourAccount: 'Protege tu cuenta y fondos',
    oneTimeVerification: 'Proceso de verificación único',
    personalInformation: 'Información Personal',
    fullLegalName: 'Nombre Legal Completo',
    enterFullNameAsOnID: 'Ingresa tu nombre completo como aparece en tu ID',
    documentType: 'Tipo de Documento',
    nationalID: 'Cédula',
    passport: 'Pasaporte',
    driversLicense: 'Licencia',
    documentNumber: 'Número de Documento',
    enterYourDocumentNumber: 'Ingresa tu número de documento',
    frontDocument: 'Documento Frontal *',
    uploadClearPhotoOfFront: 'Sube una foto clara del frente de tu documento de identidad',
    uploading: 'Subiendo...',
    tapToChange: 'Toca para cambiar',
    tapToUploadFront: 'Toca para subir frente',
    backDocument: 'Documento Trasero *',
    uploadClearPhotoOfBack: 'Sube una foto clara del reverso de tu documento de identidad',
    tapToUploadBack: 'Toca para subir reverso',
    submitting: 'Enviando...',
    submitKYCVerification: 'Enviar Verificación KYC',
    yourDataIsSecure: 'Tus Datos están Seguros',
    dataEncryptedAndSecure: 'Toda la información personal y documentos están encriptados y almacenados de forma segura. Cumplimos con regulaciones internacionales de protección de datos y nunca compartiremos tu información con terceros sin tu consentimiento.',
    kycVerified: '¡KYC Verificado!',
    identityVerifiedSuccessfully: 'Tu identidad ha sido verificada exitosamente. Ahora puedes retirar tus fondos una vez que cumplas con todos los demás requisitos.',
    kycSubmittedSuccessfully: 'KYC Enviado Exitosamente',
    kycUnderReview: 'Tu verificación KYC ha sido enviada y está bajo revisión. Serás notificado una vez que haya sido procesada (típicamente dentro de 24-48 horas).',
    submissionError: 'Error de Envío',
    errorSubmittingKYC: 'Error al enviar verificación KYC. Por favor intenta de nuevo o contacta soporte si el problema persiste.',
    
    // Balance
    balance: 'Balance',
    totalBalance: 'Balance Total',
    mxiFromVesting: 'MXI de Vesting',
    mxiFromTournaments: 'MXI de Torneos',
    mxiBalance: 'Saldo MXI',
    currentBalance: 'Saldo Actual',
    internalSimulatedBalance: 'Saldo interno simulado',
    aboutYourMXIBalance: 'Acerca de tu Saldo MXI',
    thisIsYourInternalBalance: 'Este es tu saldo interno de MXI obtenido mediante pagos en USDT ERC20',
    conversionRate: 'Tasa de conversión: 1 USDT = 2.5 MXI',
    paymentsVerifiedAutomatically: 'Los pagos se verifican automáticamente en la blockchain de Ethereum',
    requiresThreeConfirmations: 'Se requieren al menos 3 confirmaciones para acreditar el saldo',
    quickActions: 'Acciones Rápidas',
    addBalance: 'Agregar Saldo',
    payWithUSDT: 'Pagar con USDT ERC20',
    viewTransactions: 'Ver transacciones',
    
    // Vesting
    vesting: 'Vesting',
    yieldGeneration: 'Generación de Rendimiento',
    viewYieldGeneration: 'Ver generación de rendimiento',
    vestingSource: '⚠️ Fuente de Vesting',
    vestingSourceDescription: 'El vesting se genera ÚNICAMENTE del MXI comprado directamente con USDT. Las comisiones NO generan vesting. Este gráfico representa el crecimiento personal del usuario en MXI: compras, gastos, pérdidas, etc.',
    mxiPurchasedBase: 'MXI Comprado (Base de Vesting)',
    mxiInVesting: 'MXI en Vesting',
    availableForWithdrawal: 'Disponible para retiro una vez lanzada la moneda',
    blockedUntilLaunch: 'Bloqueado hasta el lanzamiento oficial',
    daysRemaining: 'días',
    balanceBlocked: 'Saldo Bloqueado',
    balanceBlockedDescription: 'El saldo de vesting no se puede unificar ni retirar hasta que se lance la moneda oficialmente. Una vez lanzada, podrás retirar tu saldo cumpliendo los requisitos de retiro (5 referidos activos y KYC aprobado).',
    timeUntilLaunch: 'Tiempo hasta el lanzamiento:',
    released: 'Liberado',
    releasePercentage: 'Porcentaje de liberación:',
    releasesCompleted: 'Liberaciones realizadas:',
    nextRelease: 'Próxima liberación:',
    withdrawalStatus: 'Estado de retiro:',
    enabled: 'Habilitado',
    blockedUntilLaunchShort: 'Bloqueado hasta lanzamiento',
    whatIsVesting: '¿Qué es el Vesting?',
    vestingDescription: 'El vesting es un mecanismo que libera gradualmente tus tokens MXI obtenidos por yield/rendimiento del MXI comprado. Esto garantiza estabilidad en el mercado y protege el valor de la moneda.',
    vestingReleaseInfo: 'Cada 10 días se libera el {{percentage}}% de tu saldo en vesting, que podrás retirar una vez cumplas los requisitos (5 referidos activos y KYC aprobado).',
    vestingReleaseInfoPreLaunch: 'Una vez lanzada la moneda, cada 10 días se liberará el {{percentage}}% de tu saldo en vesting para retiro.',
    vestingImportantNote: '⚠️ Importante: Solo el MXI comprado directamente genera rendimiento de vesting. Las comisiones NO generan vesting. El gráfico "Balance MXI" muestra tu crecimiento personal en MXI, no el vesting en sí.',
    withdrawMXI: 'Retirar MXI',
    withdrawVestingBalance: 'Retira tu saldo de vesting liberado',
    vestingInformation: 'Información de Vesting',
    everyTenDays: 'cada 10 días',
    
    // Support
    support: 'Soporte',
    getHelp: 'Obtener Ayuda',
    getAssistanceFromOurTeam: 'Obtén asistencia de nuestro equipo',
    newSupportRequest: 'Nueva Solicitud de Soporte',
    category: 'Categoría',
    general: 'General',
    kyc: 'KYC',
    withdrawal: 'Retiro',
    transaction: 'Transacción',
    technical: 'Técnico',
    other: 'Otro',
    subject: 'Asunto',
    briefDescriptionOfIssue: 'Breve descripción de tu problema',
    message: 'Mensaje',
    describeYourIssueInDetail: 'Describe tu problema en detalle...',
    sendMessage: 'Enviar Mensaje',
    yourMessageHasBeenSent: 'Tu mensaje ha sido enviado. Nuestro equipo de soporte responderá pronto.',
    failedToSendMessage: 'Error al enviar mensaje',
    noMessagesYet: 'No hay mensajes aún',
    createSupportRequest: 'Crea una solicitud de soporte para obtener ayuda de nuestro equipo',
    messageDetail: 'Vista de detalle de mensaje próximamente',
    replies: 'respuestas',
    
    // Challenges
    challengeHistory: 'Historial de Retos',
    viewGameRecords: 'Ver registros de juegos',
    all: 'Todas',
    wins: 'Victorias',
    losses: 'Derrotas',
    noHistoryYet: 'Sin Historial Aún',
    challengeHistoryWillAppear: 'Tu historial de retos aparecerá aquí una vez que participes en juegos',
    score: 'Puntuación',
    rank: 'Rango',
    won: 'Ganado',
    lost: 'Perdido',
    expiresIn: 'Expira en',
    tournamentWinnings: 'Ganancias de Torneos',
    totalWon: 'Total Ganado',
    withdrawToMXIBalance: 'Retirar a Balance MXI',
    transferWinningsToMainBalance: 'Transfiere tus ganancias a tu balance principal de MXI para usarlas en compras y otras funciones.',
    amountToWithdrawMXI: 'Monto a Retirar (MXI)',
    minimum50MXIRequired: 'Mínimo 50 MXI',
    invalidAmountEnterValid: 'Monto Inválido. Por favor ingresa un monto válido',
    minimumWithdrawalIs50: 'El retiro mínimo es de 50 MXI',
    insufficientBalanceOnlyHave: 'Solo tienes {{available}} MXI disponibles de ganancias de torneos',
    requirementsNotMetNeed5Referrals: 'Necesitas 5 referidos activos que hayan comprado el mínimo de MXI.\n\nActualmente tienes: {{count}} referidos activos',
    confirmWithdrawalToMXIBalance: 'Confirmar Retiro a Balance MXI',
    doYouWantToTransferFromWinnings: '¿Deseas transferir {{amount}} MXI de ganancias de torneos a tu balance principal?\n\nEsto te permitirá usar estos MXI para compras y otras funciones.',
    withdrawalSuccessfulTransferred: '{{amount}} MXI se han transferido a tu balance principal',
    
    // Lottery/Bonus
    loadingBonus: 'Cargando bonus...',
    noActiveBonusRound: 'No hay ronda de bonus activa',
    retry: 'Reintentar',
    round: 'Ronda',
    open: 'Abierto',
    locked: 'Bloqueado',
    prizePool: 'Pozo de Premios (90%)',
    totalPool: 'Pozo Total',
    ticketsSold: 'Boletos Vendidos',
    ticketPrice: 'Precio del Boleto',
    yourTickets: 'Tus Boletos',
    availableMXI: 'MXI Disponible',
    purchaseTickets: 'Comprar Boletos',
    buyBetween1And20Tickets: 'Compra entre 1 y 20 boletos. Máximo 20 boletos por usuario por ronda.',
    buyTickets: 'Comprar Boletos',
    numberOfTickets: 'Número de Boletos (1-20)',
    enterQuantity: 'Ingresa cantidad',
    tickets: 'Boletos',
    pricePerTicket: 'Precio por boleto',
    totalCost: 'Costo Total',
    selectPaymentSource: 'Seleccionar Fuente de Pago',
    chooseWhichMXIBalance: 'Elige qué balance de MXI usar para esta compra',
    mxiPurchasedSource: 'MXI Comprados',
    mxiFromCommissionsSource: 'MXI de Comisiones',
    mxiFromChallengesSource: 'MXI de Retos',
    howItWorksBonus: 'Cómo Funciona',
    eachTicketCosts2MXI: 'Cada boleto cuesta 2 MXI',
    buyBetween1And20TicketsPerRound: 'Compra entre 1 y 20 boletos por ronda',
    roundLocksWhen1000TicketsSold: 'La ronda se bloquea cuando se venden 1000 boletos',
    winnerReceives90Percent: 'El ganador recibe el 90% del pozo total',
    winnerAnnouncedOnSocialMedia: 'El ganador se anuncia en redes sociales',
    purchaseIsFinalNoRefunds: 'La compra es final - sin reembolsos',
    insufficientBalanceNeedForTickets: 'Necesitas {{needed}} MXI para comprar {{quantity}} boleto(s).\n\nTu balance disponible para retos es {{available}} MXI.\n\nEl MXI disponible incluye:\n- MXI comprados directamente\n- MXI de comisiones unificadas\n- MXI de ganancias de retos',
    insufficientBalanceInSource: 'Tu balance de {{source}} ({{available}} MXI) no es suficiente para cubrir el costo ({{needed}} MXI).',
    successfullyPurchasedTickets: '¡Compraste exitosamente {{count}} boleto(s) por {{cost}} MXI usando {{source}}!',
    failedToPurchaseTickets: 'Error al comprar boletos',
    
    // USDT Payment Page
    payInUSDT: 'Pagar en USDT',
    selectPaymentNetwork: 'Selecciona la Red de Pago',
    eachNetworkValidatesIndependently: 'Cada red valida sus transacciones de forma independiente',
    networkDescription: 'Red {{network}} - Validación independiente',
    validationIn: 'Validación en {{network}}',
    paymentsOnlyValidatedOnNetwork: 'Los pagos en {{network}} solo se validan en la red {{network}}',
    paymentInstructions: 'Instrucciones de Pago',
    selectNetworkYouWillUse: 'Selecciona la red que vas a usar ({{label}})',
    sendUSDTFromAnyWallet: 'Envía USDT desde cualquier wallet a la dirección receptora',
    minimumAmountLabel: 'Monto mínimo: {{min}} USDT',
    copyTransactionHash: 'Copia el hash de la transacción (txHash)',
    pasteHashAndVerify: 'Pega el txHash aquí y verifica el pago',
    youWillReceiveMXI: 'Recibirás MXI = USDT × {{rate}}',
    recipientAddress: 'Dirección Receptora ({{label}})',
    addressCopied: 'Dirección copiada al portapapeles',
    onlySendUSDTOnNetwork: '⚠️ Solo envía USDT en la red {{network}} ({{label}})',
    mxiCalculator: 'Calculadora de MXI',
    transactionHashTxHash: 'Hash de Transacción (txHash)',
    pasteYourTransactionHash: 'Pega el hash de tu transacción de {{network}} aquí',
    correctLength: '✓ Longitud correcta',
    charactersCount: '⚠️ {{count}}/66 caracteres',
    verifyAutomatically: 'Verificar Automáticamente',
    verifying: 'Verificando...',
    requestManualVerification: 'Solicitar Verificación Manual',
    sendingRequest: 'Enviando solicitud...',
    importantValidationByNetwork: '⚠️ Importante - Validación por Red',
    eachNetworkValidatesIndependentlyInfo: 'Cada red valida sus transacciones de forma independiente',
    paymentsOnETHOnlyValidatedOnETH: 'Los pagos en ETH solo se validan en la red Ethereum',
    paymentsOnBNBOnlyValidatedOnBNB: 'Los pagos en BNB solo se validan en la red BNB Chain',
    paymentsOnPolygonOnlyValidatedOnPolygon: 'Los pagos en Polygon solo se validan en la red Polygon',
    ensureCorrectNetworkBeforeVerifying: 'Asegúrate de seleccionar la red correcta antes de verificar',
    transactionMustHave3Confirmations: 'La transacción debe tener al menos 3 confirmaciones',
    cannotUseSameHashTwice: '⚠️ NO PUEDES USAR EL MISMO HASH DOS VECES - Sistema anti-duplicados activo',
    ifAutomaticFailsUseManual: '📋 Si la verificación automática falla, usa la verificación manual',
    pasteHashHere: 'Pega el hash aquí',
    hashInvalid: 'Hash Inválido',
    hashMustStartWith0x: 'El hash de transacción debe comenzar con 0x y tener 66 caracteres\n\nHash actual: {{count}} caracteres',
    confirmNetwork: '⚠️ Confirmar Red',
    areYouSureTransactionOnNetwork: '¿Estás seguro de que la transacción fue realizada en {{network}} ({{label}})?\n\nLa validación se hará SOLO en esta red.',
    yesVerify: 'Sí, verificar',
    requestManualVerificationTitle: '📋 Solicitar Verificación Manual',
    doYouWantToSendManualRequest: '¿Deseas enviar una solicitud de verificación manual al administrador?\n\nRed: {{network}} ({{label}})\nHash: {{hash}}\n\nUn administrador revisará tu transacción y la aprobará manualmente. Este proceso puede tomar hasta 2 horas.',
    sendRequest: 'Enviar Solicitud',
    
    // Manual Verification
    manualVerification: 'Verificación Manual',
    verificationOfNowPaymentsPayments: 'Verificación de Pagos NowPayments',
    viewHistoryAndRequestManualVerification: 'Aquí puedes ver el historial de tus pagos realizados a través de NowPayments y solicitar verificación manual si un pago no se acreditó automáticamente.',
    noNowPaymentsRegistered: 'No tienes pagos de NowPayments registrados.',
    order: 'Orden',
    paymentID: 'Payment ID',
    date: 'Fecha',
    manualVerificationRequested: '⏳ Verificación manual solicitada. Un administrador revisará tu pago pronto.',
    administratorReviewingPayment: '👀 Un administrador está revisando tu pago ahora.',
    administratorRequestsMoreInfo: '📋 El administrador solicita más información',
    informationRequested: 'Información solicitada:',
    responseSent: '✅ Respuesta enviada. El administrador la revisará pronto.',
    respond: 'Responder',
    manualVerificationApproved: '✅ Verificación manual aprobada',
    rejectedReason: '❌ Rechazado: {{reason}}',
    noReason: 'Sin motivo',
    paymentCreditedSuccessfully: '✅ Pago acreditado exitosamente',
    verificationOfUSDTPayments: 'Verificación de Pagos USDT',
    requestManualVerificationOfUSDT: 'Solicita verificación manual de tus pagos USDT directos ingresando el hash de la transacción. Un administrador revisará tu pago y lo acreditará manualmente.',
    usdtPaymentHistory: 'Historial de Pagos USDT',
    noUSDTPaymentsRegistered: 'No tienes pagos USDT registrados.',
    network: 'Red',
    transactionHash: 'Hash de Transacción',
    requestManualUSDTVerification: 'Solicitar Verificación Manual USDT',
    doYouWantToRequestManualVerification: '¿Deseas enviar una solicitud de verificación manual al administrador?\n\nRed: {{network}} ({{label}})\nHash: {{hash}}\n\nUn administrador revisará tu transacción y la aprobará manualmente. Este proceso puede tomar hasta 2 horas.',
    requestSentSuccessfully: 'Solicitud Enviada Exitosamente',
    manualVerificationRequestSent: 'Tu solicitud de verificación manual ha sido enviada exitosamente.\n\nOrden: {{order}}\nRed: {{network}}\nHash: {{hash}}\n\nUn administrador revisará tu transacción en las próximas 2 horas.\n\nPuedes ver el estado de tu solicitud en la sección de historial.',
    hashDuplicate: 'Hash Duplicado',
    hashAlreadyRegistered: 'Este hash de transacción ya ha sido registrado anteriormente.\n\nOrden: {{order}}\nEstado: {{status}}\n\nNo puedes usar el mismo hash de transacción dos veces.',
    errorSendingRequest: 'Error al Enviar Solicitud',
    couldNotSendVerificationRequest: 'No se pudo enviar la solicitud de verificación.\n\nDetalles: {{error}}\nCódigo: {{code}}\n\nPor favor intenta nuevamente o contacta a soporte.',
    respondToAdministrator: 'Responder al Administrador',
    yourResponse: 'Tu respuesta:',
    writeYourResponseHere: 'Escribe tu respuesta aquí...',
    send: 'Enviar',
    responseSentToAdministrator: 'Tu respuesta ha sido enviada al administrador. Recibirás una notificación cuando tu solicitud sea revisada.',
    errorSendingResponse: 'Error al enviar respuesta',
    nowPayments: 'NowPayments',
    directUSDT: 'USDT Directo',
    verificationOfNowPayments: 'Verificación de Pagos NowPayments',
    verificationOfUSDT: 'Verificación de Pagos USDT',
    requestManualVerificationNowPayments: '📋 Solicitar Verificación Manual',
    doYouWantToRequestNowPaymentsVerification: '¿Deseas solicitar la verificación manual de este pago de NowPayments?\n\nMonto: {{amount}} USDT\nMXI: {{mxi}} MXI\nOrden: {{order}}\n\nUn administrador revisará tu pago y lo aprobará manualmente. Este proceso puede tomar hasta 2 horas.',
    request: 'Solicitar',
    requestSentMessage: 'Tu solicitud de verificación manual ha sido enviada exitosamente.\n\nUn administrador revisará tu pago en las próximas 2 horas.\n\nRecibirás una notificación cuando tu pago sea verificado.',
    existingRequest: 'Solicitud Existente',
    existingRequestMessage: 'Ya existe una solicitud de verificación para este pago.\n\nEstado: {{status}}\n\nPor favor, espera a que el administrador la revise.',
    
    // Transaction History Page
    transactionHistoryTitle: 'Historial de Transacciones',
    loadingHistory: 'Cargando historial...',
    pending: 'Pendientes',
    successful: 'Exitosas',
    failed: 'Fallidas',
    noTransactions: 'No hay transacciones',
    noTransactionsYet: 'Aún no has realizado ninguna transacción',
    noPendingTransactions: 'No hay transacciones pendientes',
    noSuccessfulTransactions: 'No hay transacciones exitosas',
    noFailedTransactions: 'No hay transacciones fallidas',
    purchaseMXINowPayments: 'Compra MXI (NOWPayments)',
    purchaseMXIOKX: 'Compra MXI (OKX)',
    manualPayment: 'Pago Manual',
    commission: 'Comisión',
    completed: 'Completado',
    confirmed: 'Confirmado',
    waitingForPayment: 'Esperando Pago',
    confirming: 'Confirmando',
    expired: 'Expirado',
    cancelled: 'Cancelado',
    walletAddress: 'Dirección de Billetera',
    completedOn: 'Completado',
    noPaymentID: 'Sin ID de Pago',
    paymentCreationFailed: 'Esta transacción no tiene un ID de pago válido. Es probable que la creación del pago haya fallado.',
    cancelTransaction: 'Cancelar Transacción',
    areYouSureCancelTransaction: '¿Estás seguro de que deseas cancelar esta transacción pendiente?',
    noCancelIt: 'No',
    yesCancelIt: 'Sí, Cancelar',
    transactionCancelled: 'La transacción ha sido cancelada',
    couldNotCancelTransaction: 'No se pudo cancelar la transacción',
    errorVerifying: 'Error al Verificar',
    couldNotVerifyPaymentStatus: 'No se pudo verificar el estado del pago. Por favor intenta nuevamente.',
    viewDetails: 'Ver Detalles',
    errorDetails: 'Detalles del Error',
    noDetailsAvailable: 'No hay detalles disponibles',
    paymentConfirmed: 'Pago Confirmado',
    paymentConfirmedBalanceUpdated: 'Tu pago ha sido confirmado. Tu saldo ha sido actualizado.',
    paymentFailed: 'Pago Fallido',
    paymentFailedOrExpired: 'El pago ha {{status}}. Puedes intentar crear una nueva orden.',
    paymentStatus: 'Estado del Pago',
    currentStatus: 'Estado actual: {{status}}\n\nEl pago aún está siendo procesado.',
    couldNotVerifyStatus: 'No se pudo verificar el estado del pago',
    networkError: 'Error de Red',
    couldNotConnectToServer: 'No se pudo conectar con el servidor. Por favor verifica tu conexión a internet e intenta nuevamente.',
    pay: 'Pagar',
    verify: 'Verificar',
    viewTechnicalDetails: 'Ver detalles técnicos',
    allTransactions: 'Todas',
    pendingTransactions: 'Pendientes',
    successfulTransactions: 'Exitosas',
    failedTransactions: 'Fallidas',
    
    // Withdrawals History
    withdrawalHistoryTitle: 'Historial de Retiros',
    noWithdrawalsYet: 'Sin Retiros Aún',
    withdrawalHistoryWillAppear: 'Tu historial de retiros aparecerá aquí una vez que realices tu primer retiro.',
    processing: 'Procesando',
    
    // Vesting
    vestingBalance: 'Balance de Vesting',
    mxiVestingBalance: 'Balance MXI (Vesting)',
    loadingVestingData: 'Cargando datos de vesting...',
    
    // Edit Profile
    enterYourFullName: 'Ingresa tu nombre completo',
    enterFullLegalName: 'Ingresa tu nombre legal completo como aparece en tu identificación',
    enterYourIDNumber: 'Ingresa tu número de identificación',
    enterNationalID: 'Ingresa tu cédula nacional, pasaporte o número de licencia de conducir',
    residentialAddress: 'Dirección Residencial',
    enterYourResidentialAddress: 'Ingresa tu dirección residencial',
    enterCompleteAddress: 'Ingresa tu dirección residencial completa',
    emailAddressReadOnly: 'Correo Electrónico (Solo lectura)',
    referralCodeReadOnly: 'Código de Referido (Solo lectura)',
    saveChanges: 'Guardar Cambios',
    profileLocked: 'Perfil Bloqueado',
    profileCannotBeEdited: 'Tu perfil no puede ser editado porque tu verificación KYC está {{status}}.',
    profileInfoCanOnlyBeModified: 'La información del perfil solo puede modificarse antes de que se apruebe la verificación KYC.',
    backToProfile: 'Volver al Perfil',
    importantNotice: 'Aviso Importante',
    canOnlyEditBeforeKYC: 'Solo puedes editar la información de tu perfil antes de que se apruebe tu verificación KYC. Asegúrate de que toda la información sea precisa antes de enviar tu KYC.',
    emailAndReferralCannotChange: 'Tu dirección de correo electrónico y código de referido no se pueden cambiar. Si necesitas actualizarlos, contacta a soporte.',
    profileUpdatedSuccessfully: 'Tu perfil se ha actualizado exitosamente',
    failedToUpdateProfile: 'Error al actualizar el perfil. Por favor intenta nuevamente.',
    pleaseEnterFullName: 'Por favor ingresa tu nombre completo',
    pleaseEnterAddress: 'Por favor ingresa tu dirección',
    pleaseEnterIDNumber: 'Por favor ingresa tu número de identificación',
    idNumberAlreadyRegistered: 'Este número de identificación ya está registrado en otra cuenta',
    
    // Terms
    viewTerms: 'Ver Términos y Condiciones',
    acceptTerms: 'He leído y acepto los',
    
    // Messages
    emailVerificationRequired: 'Verificación de Email Requerida',
    pleaseVerifyEmail: 'Por favor verifica tu dirección de correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada para el enlace de verificación.',
    resendEmail: 'Reenviar Email',
    accountCreatedSuccess: '¡Cuenta creada exitosamente! Por favor revisa tu correo para verificar tu cuenta.',
    loginSuccess: 'Inicio de sesión exitoso',
    loginError: 'Error de Inicio de Sesión',
    invalidCredentials: 'Correo electrónico o contraseña incorrectos. Por favor verifica tus credenciales e intenta nuevamente.',
    errorLoggingIn: 'Error al iniciar sesión. Por favor intenta nuevamente.',
    
    // Errors
    fillAllFields: 'Por favor completa todos los campos requeridos',
    invalidEmail: 'Por favor ingresa un correo electrónico válido',
    passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
    passwordsDontMatch: 'Las contraseñas no coinciden',
    
    // Info
    minimumInvestment: 'Inversión mínima desde 50 USDT',
    poolClosesOn: 'La Pre-Venta cierra el 15 de febrero de 2026 a las 12:00 UTC',
    
    // Admin
    adminPanel: 'Panel de Administrador',
    manageUsers: 'Gestionar usuarios y sistema',
    
    // Stats
    memberSince: 'Miembro desde',
    
    // Actions
    refresh: 'Actualizar',
    updating: 'Actualizando...',
    
    // Conversion
    equivalent: 'Equivalente',
    
    // Time
    processingTime24to48: 'Tiempo de procesamiento: 24-48 horas',
    
    // Important
    important: 'Importante',
    note: 'Nota',
    warning: 'Advertencia',
    
    // Calculator
    calculator: 'Calculadora',
    
    // Profile Page - Additional
    updateYourInfo: 'Actualiza tu información',
    areYouSureLogout: '¿Estás seguro que deseas cerrar sesión?',
    
    // Support Page - Additional
    supportAndHelp: 'Soporte y Ayuda',
    getAssistance: 'Obtén asistencia de nuestro equipo',
    newSupportRequestButton: 'Nueva Solicitud de Soporte',
    categoryLabel: 'Categoría',
    generalCategory: 'General',
    kycCategory: 'KYC',
    withdrawalCategory: 'Retiro',
    transactionCategory: 'Transacción',
    technicalCategory: 'Técnico',
    otherCategory: 'Otro',
    subjectLabel: 'Asunto',
    briefDescription: 'Breve descripción de tu problema',
    messageLabel: 'Mensaje',
    describeIssueInDetail: 'Describe tu problema en detalle...',
    sendMessageButton: 'Enviar Mensaje',
    messageSentSuccess: 'Tu mensaje ha sido enviado. Nuestro equipo de soporte responderá pronto.',
    failedToSendMessageError: 'Error al enviar mensaje',
    noMessagesYetTitle: 'No hay mensajes aún',
    createSupportRequestMessage: 'Crea una solicitud de soporte para obtener ayuda de nuestro equipo',
    messageDetailComingSoon: 'Vista de detalle de mensaje próximamente',
    repliesCount: 'respuestas',
    pleaseEnterSubjectAndMessage: 'Por favor completa todos los campos',
    
    // Contrataciones Page
    buyMXI: 'Comprar MXI',
    diagnosticSystem: 'Diagnóstico del Sistema',
    testServerConfiguration: 'Probar Configuración del Servidor',
    testingConfiguration: 'Probando configuración...',
    configurationCorrect: 'Configuración Correcta',
    environmentVariablesConfigured: 'Las variables de entorno están configuradas correctamente. El sistema de pagos debería funcionar.',
    serverConfigurationError: 'Error de Configuración del Servidor',
    paymentSystemNotConfigured: 'El sistema de pagos no está configurado correctamente. Este es un problema del servidor que debe ser resuelto por el administrador.',
    problemDetected: 'Problema Detectado:',
    nowPaymentsCredentialsNotConfigured: 'Las credenciales de NOWPayments no están configuradas en el servidor',
    solutionForAdministrator: 'Solución (Para el Administrador):',
    goToSupabaseDashboard: '1. Ir al Dashboard de Supabase',
    navigateToProjectSettings: '2. Navegar a Project Settings → Edge Functions',
    addEnvironmentVariables: '3. Agregar las siguientes variables de entorno:',
    redeployEdgeFunctions: '4. Redesplegar las Edge Functions',
    contactAdministrator: 'Por favor, contacta al administrador del sistema para resolver este problema.',
    importantPaymentInfo: 'Importante',
    paymentsProcessedInUSDT: 'Los pagos se procesan con USDT en la red Ethereum (ERC20)',
    useCorrectNetwork: 'Asegúrate de usar la red correcta al pagar',
    paymentExpiresIn1Hour: 'El pago expira en 1 hora',
    tokensAutomaticallyCredited: 'Los tokens se acreditan automáticamente al confirmar',
    currentPresalePhaseTitle: 'Fase Actual de Preventa',
    activePhaseLabel: 'Fase Activa',
    currentPriceLabel: 'Precio Actual',
    tokensSoldLabel: 'Tokens Vendidos',
    untilNextPhaseLabel: 'Hasta Siguiente Fase',
    makePayment: 'Realizar Pago',
    amountInUSDT: 'Monto en USDT (mín: 3, máx: 500,000)',
    enterAmount: 'Ingresa el monto',
    youWillReceive: 'Recibirás:',
    payWithUSDTETH: 'Pagar con USDT (ETH)',
    recentPayments: 'Pagos Recientes',
    amount: 'Monto',
    price: 'Precio',
    status: 'Estado',
    poolBenefits: 'Beneficios del Pool',
    receiveMXITokens: 'Recibe MXI tokens por tu participación',
    generateYield: 'Genera rendimientos del 0.005% por hora',
    earnCommissions: 'Gana comisiones por referidos (5%, 2%, 1%)',
    participateInLiquidityPool: 'Participa en el pool de liquidez',
    earlyAccessToLaunch: 'Acceso anticipado al lanzamiento oficial',
    preferentialPresalePrice: 'Precio preferencial en preventa (aumenta por fase)',
    errorModalTitle: 'Error de Pago',
    errorMessage: 'Mensaje de Error:',
    errorCode: 'Código de Error:',
    requestID: 'Request ID:',
    httpStatusCode: 'Código de Estado HTTP:',
    timestamp: 'Timestamp:',
    copyDetailsToConsole: 'Copiar Detalles a Consola',
    detailsCopied: 'Detalles Copiados',
    errorDetailsCopiedToConsole: 'Los detalles del error han sido copiados al log de la consola',
    minimumAmountIs3USDT: 'El monto mínimo es 3 USDT',
    maximumAmountIs500000USDT: 'El monto máximo es 500,000 USDT',
    paymentCreated: 'Pago Creado',
    paymentPageOpened: 'Se ha abierto la página de pago. Completa el pago y regresa a la app para ver el estado.',
    paymentCompleted: '¡Pago Completado!',
    youHaveReceived: 'Has recibido {{amount}} MXI tokens',
    paymentFailedTitle: 'Pago Fallido',
    paymentCouldNotBeCompleted: 'El pago no se pudo completar. Por favor, intenta nuevamente.',
    paymentExpired: 'Pago Expirado',
    paymentTimeExpired: 'El tiempo para completar el pago ha expirado. Por favor, crea un nuevo pago.',
    ifExperiencingProblems: 'Si experimentas problemas con los pagos, usa este botón para verificar que las variables de entorno estén configuradas correctamente.',
    
    // Additional hardcoded text found in files
    copied2: 'Copiado',
    addressCopiedToClipboard: 'Dirección copiada al portapapeles',
    pleaseEnterTransactionHash: 'Por favor ingresa el hash de la transacción',
    invalidHash: 'Hash Inválido',
    confirmNetworkTitle: 'Confirmar Red',
    areYouSureTransaction: '¿Estás seguro de que la transacción fue realizada en {{network}} ({{label}})?\n\nLa validación se hará SOLO en esta red.',
    yesVerifyButton: 'Sí, verificar',
    requestManualVerificationButton: 'Solicitar Verificación Manual',
    sendingRequestText: 'Enviando solicitud...',
    hashDuplicateTitle: 'Hash Duplicado',
    hashAlreadyRegisteredText: 'Este hash de transacción ya ha sido registrado anteriormente.\n\nOrden: {{order}}\nEstado: {{status}}\n\nNo puedes usar el mismo hash de transacción dos veces.',
    requestSentSuccessfullyTitle: 'Solicitud Enviada Exitosamente',
    manualVerificationRequestSentText: 'Tu solicitud de verificación manual ha sido enviada exitosamente.\n\nOrden: {{order}}\nRed: {{network}}\nHash: {{hash}}\n\nUn administrador revisará tu transacción en las próximas 2 horas.\n\nPuedes ver el estado de tu solicitud en la sección de historial.',
    errorSendingRequestTitle: 'Error al Enviar Solicitud',
    couldNotSendVerificationRequestText: 'No se pudo enviar la solicitud de verificación.\n\nDetalles: {{error}}\nCódigo: {{code}}\n\nPor favor intenta nuevamente o contacta a soporte.',
    paymentConfirmedTitle: 'Pago Confirmado',
    paymentConfirmedText: 'Se acreditaron {{amount}} MXI a tu cuenta.\n\nRed: {{network}}\nUSDT pagados: {{usdt}}',
    viewBalance: 'Ver Saldo',
    verificationError: 'Error de Verificación',
    transactionNotFound: 'Transacción No Encontrada',
    transactionNotFoundText: 'No se encontró la transacción en {{network}}.\n\n📋 Pasos para solucionar:\n\n1. Verifica que el hash sea correcto\n2. Asegúrate de que la transacción esté en la red {{network}}\n3. Espera a que la transacción tenga al menos 1 confirmación\n4. Verifica en un explorador de bloques:\n   • Ethereum: etherscan.io\n   • BNB Chain: bscscan.com\n   • Polygon: polygonscan.com',
    waitingConfirmations: 'Esperando Confirmaciones',
    waitingConfirmationsText: 'La transacción necesita más confirmaciones.\n\n{{message}}\n\nConfirmaciones actuales: {{confirmations}}\nConfirmaciones requeridas: {{required}}\n\n⏰ Por favor espera unos minutos e intenta nuevamente.',
    insufficientAmountTitle: 'Monto Insuficiente',
    insufficientAmountText: 'El monto mínimo es {{min}} USDT.\n\n{{message}}\n\nMonto recibido: {{usdt}} USDT\nMonto mínimo: {{minimum}} USDT',
    alreadyProcessed: 'Ya Procesado',
    alreadyProcessedText: 'Esta transacción ya ha sido procesada anteriormente.\n\nSi crees que esto es un error, contacta a soporte.',
    invalidTransfer: 'Transferencia No Válida',
    invalidTransferText: 'No se encontró una transferencia USDT válida a la dirección receptora.\n\n📋 Verifica:\n\n1. Que enviaste USDT (no otro token)\n2. Que la dirección receptora es correcta:\n   {{address}}\n3. Que la transacción está en {{network}}',
    transactionFailed: 'Transacción Fallida',
    transactionFailedText: 'La transacción falló en la blockchain.\n\nVerifica el estado de la transacción en un explorador de bloques.',
    invalidNetworkTitle: 'Red No Válida',
    invalidNetworkText: 'Red no válida seleccionada.\n\nSelecciona una de las redes disponibles: Ethereum, BNB Chain o Polygon.',
    configurationError: 'Error de Configuración',
    configurationErrorText: 'Error de configuración del servidor.\n\n{{message}}\n\n⚠️ Contacta al administrador del sistema.',
    incorrectNetwork: 'Red Incorrecta',
    incorrectNetworkText: 'El RPC está conectado a la red incorrecta.\n\nContacta al administrador del sistema.',
    authenticationError: 'Error de Autenticación',
    authenticationErrorText: 'Tu sesión ha expirado.\n\nPor favor cierra sesión y vuelve a iniciar sesión.',
    incompleteData: 'Datos Incompletos',
    incompleteDataText: 'Faltan datos requeridos.\n\nAsegúrate de ingresar el hash de transacción.',
    databaseError: 'Error de Base de Datos',
    databaseErrorText: 'Error al procesar la transacción.\n\n{{message}}\n\nPor favor intenta nuevamente o contacta a soporte.',
    rpcConnectionError: 'Error de Conexión RPC',
    rpcConnectionErrorText: 'No se pudo conectar al nodo de blockchain.\n\n{{message}}\n\nPor favor intenta nuevamente en unos minutos.',
    internalError: 'Error Interno',
    internalErrorText: 'Error interno del servidor.\n\n{{message}}\n\nPor favor intenta nuevamente o contacta a soporte.',
    unknownError: 'Error Desconocido',
    unknownErrorText: 'Error al verificar el pago.\n\nPor favor intenta nuevamente o contacta a soporte.',
    connectionError: 'Error de Conexión',
    connectionErrorText: 'No se pudo conectar con el servidor.\n\nDetalles técnicos:\n{{message}}\n\n📋 Pasos para solucionar:\n\n1. Verifica tu conexión a internet\n2. Intenta nuevamente en unos segundos\n3. Si el problema persiste, contacta a soporte',
    pasteHashHereText: 'Pega el hash aquí',
    loadingUserData: 'Cargando datos de usuario...',
    loadingKYCData: 'Cargando datos KYC...',
    successUploadDocument: 'Éxito',
    frontDocumentUploaded: '¡Documento frontal subido exitosamente!',
    backDocumentUploaded: '¡Documento trasero subido exitosamente!',
    uploadError: 'Error de Subida',
    errorUploadingDocument: 'Error al subir documento. Por favor intenta de nuevo.',
    pleaseEnterFullNameText: 'Por favor ingresa tu nombre completo',
    pleaseEnterDocumentNumber: 'Por favor ingresa tu número de documento',
    pleaseUploadFrontDocument: 'Por favor sube el frente de tu documento de identidad',
    pleaseUploadBackDocument: 'Por favor sube el reverso de tu documento de identidad',
    idCard: 'Cédula',
    passportDoc: 'Pasaporte',
    driversLicenseDoc: 'Licencia',
    withdrawalHistoryTitle2: 'Historial de Retiros',
    processing2: 'Procesando',
    loadingVestingDataText: 'Cargando datos de vesting...',
    errorLoadingVestingData: 'Error al cargar datos de vesting',
    couldNotLoadVestingInfo: 'No se pudo cargar la información de vesting',
    vestingSourceTitle: 'Fuente de Vesting',
    vestingSourceDescriptionText: 'El vesting se genera ÚNICAMENTE del MXI comprado directamente con USDT. Las comisiones NO generan vesting. Este gráfico representa el crecimiento personal del usuario en MXI: compras, gastos, pérdidas, etc.',
    mxiPurchasedVestingBaseText: 'MXI Comprado (Base de Vesting)',
    mxiInVestingText: 'MXI en Vesting',
    availableForWithdrawalText: 'Disponible para retiro una vez lanzada la moneda',
    blockedUntilLaunchText: 'Bloqueado hasta el lanzamiento oficial',
    daysRemainingText: 'días',
    balanceBlockedTitle: 'Saldo Bloqueado',
    balanceBlockedDescriptionText: 'El saldo de vesting no se puede unificar ni retirar hasta que se lance la moneda oficialmente. Una vez lanzada, podrás retirar tu saldo cumpliendo los requisitos de retiro (5 referidos activos y KYC aprobado).',
    timeUntilLaunchText: 'Tiempo hasta el lanzamiento:',
    releasedText: 'Liberado',
    releasePercentageText: 'Porcentaje de liberación:',
    releasesCompletedText: 'Liberaciones realizadas:',
    nextReleaseText: 'Próxima liberación:',
    withdrawalStatusText: 'Estado de retiro:',
    enabledText: 'Habilitado',
    blockedUntilLaunchShortText: 'Bloqueado hasta lanzamiento',
    whatIsVestingText: '¿Qué es el Vesting?',
    vestingDescriptionText: 'El vesting es un mecanismo que libera gradualmente tus tokens MXI obtenidos por yield/rendimiento del MXI comprado. Esto garantiza estabilidad en el mercado y protege el valor de la moneda.',
    vestingReleaseInfoText: 'Cada 10 días se libera el {{percentage}}% de tu saldo en vesting, que podrás retirar una vez cumplas los requisitos (5 referidos activos y KYC aprobado).',
    vestingReleaseInfoPreLaunchText: 'Una vez lanzada la moneda, cada 10 días se liberará el {{percentage}}% de tu saldo en vesting para retiro.',
    vestingImportantNoteText: '⚠️ Importante: Solo el MXI comprado directamente genera rendimiento de vesting. Las comisiones NO generan vesting. El gráfico "Balance MXI" muestra tu crecimiento personal en MXI, no el vesting en sí.',
    withdrawMXIText: 'Retirar MXI',
    withdrawVestingBalanceText: 'Retira tu saldo de vesting liberado',
    vestingInformationText: 'Información de Vesting',
    everyTenDaysText: 'cada 10 días',
    bonusParticipation: 'Bonus de Participación',
    loadingBonusText: 'Cargando bonus...',
    noActiveBonusRoundText: 'No hay ronda de bonus activa',
    retryButton: 'Reintentar',
    roundText: 'Ronda',
    openText: 'Abierto',
    lockedText: 'Bloqueado',
    prizePoolText: 'Pozo de Premios (90%)',
    totalPoolText: 'Pozo Total',
    ticketsSoldText: 'Boletos Vendidos',
    ticketPriceText: 'Precio del Boleto',
    yourTicketsText: 'Tus Boletos',
    availableMXIText: 'MXI Disponible',
    purchaseTicketsText: 'Comprar Boletos',
    buyBetween1And20TicketsText: 'Compra entre 1 y 20 boletos. Máximo 20 boletos por usuario por ronda.',
    buyTicketsText: 'Comprar Boletos',
    numberOfTicketsText: 'Número de Boletos (1-20)',
    enterQuantityText: 'Ingresa cantidad',
    ticketsText: 'Boletos',
    pricePerTicketText: 'Precio por boleto',
    totalCostText: 'Costo Total',
    selectPaymentSourceText: 'Seleccionar Fuente de Pago',
    chooseWhichMXIBalanceText: 'Elige qué balance de MXI usar para esta compra',
    mxiPurchasedSourceText: 'MXI Comprados',
    mxiFromCommissionsSourceText: 'MXI de Comisiones',
    mxiFromChallengesSourceText: 'MXI de Retos',
    howItWorksBonusText: 'Cómo Funciona',
    eachTicketCosts2MXIText: 'Cada boleto cuesta 2 MXI',
    buyBetween1And20TicketsPerRoundText: 'Compra entre 1 y 20 boletos por ronda',
    roundLocksWhen1000TicketsSoldText: 'La ronda se bloquea cuando se venden 1000 boletos',
    winnerReceives90PercentText: 'El ganador recibe el 90% del pozo total',
    winnerAnnouncedOnSocialMediaText: 'El ganador se anuncia en redes sociales',
    purchaseIsFinalNoRefundsText: 'La compra es final - sin reembolsos',
    insufficientBalanceNeedForTicketsText: 'Necesitas {{needed}} MXI para comprar {{quantity}} boleto(s).\n\nTu balance disponible para retos es {{available}} MXI.\n\nEl MXI disponible incluye:\n- MXI comprados directamente\n- MXI de comisiones unificadas\n- MXI de ganancias de retos',
    insufficientBalanceInSourceText: 'Tu balance de {{source}} ({{available}} MXI) no es suficiente para cubrir el costo ({{needed}} MXI).',
    successfullyPurchasedTicketsText: '¡Compraste exitosamente {{count}} boleto(s) por {{cost}} MXI usando {{source}}!',
    failedToPurchaseTicketsText: 'Error al comprar boletos',
    pleaseEnterValidQuantity: 'Por favor ingresa una cantidad válida entre 1 y 20',
    continueButton: 'Continuar',
    cancelButton: 'Cancelar',
    successTitle: '¡Éxito!',
    errorTitle: 'Error',
    withdrawalHistoryTitle2: 'Historial de Retiros',
    noWithdrawalsYetText: 'Sin Retiros Aún',
    withdrawalHistoryWillAppearText: 'Tu historial de retiros aparecerá aquí una vez que realices tu primer retiro.',
    walletAddressText: 'Dirección de Billetera:',
    completedText: 'Completado:',
    supportAndHelpText: 'Soporte y Ayuda',
    getAssistanceText: 'Obtén asistencia de nuestro equipo',
    newSupportRequestButtonText: 'Nueva Solicitud de Soporte',
    categoryLabelText: 'Categoría',
    generalCategoryText: 'General',
    kycCategoryText: 'KYC',
    withdrawalCategoryText: 'Retiro',
    transactionCategoryText: 'Transacción',
    technicalCategoryText: 'Técnico',
    otherCategoryText: 'Otro',
    subjectLabelText: 'Asunto',
    briefDescriptionText: 'Breve descripción de tu problema',
    messageLabelText: 'Mensaje',
    describeIssueInDetailText: 'Describe tu problema en detalle...',
    sendMessageButtonText: 'Enviar Mensaje',
    messageSentSuccessText: 'Tu mensaje ha sido enviado. Nuestro equipo de soporte responderá pronto.',
    failedToSendMessageErrorText: 'Error al enviar mensaje',
    noMessagesYetTitleText: 'No hay mensajes aún',
    createSupportRequestMessageText: 'Crea una solicitud de soporte para obtener ayuda de nuestro equipo',
    messageDetailComingSoonText: 'Vista de detalle de mensaje próximamente',
    repliesCountText: 'respuestas',
    pleaseEnterSubjectAndMessageText: 'Por favor completa todos los campos',
    challengeHistoryText: 'Historial de Retos',
    viewGameRecordsText: 'Ver registros de juegos',
    allText: 'Todas',
    winsText: 'Victorias',
    lossesText: 'Derrotas',
    noHistoryYetText: 'Sin Historial Aún',
    challengeHistoryWillAppearText: 'Tu historial de retos aparecerá aquí una vez que participes en juegos',
    scoreText: 'Puntuación',
    rankText: 'Rango',
    wonText: 'Ganado',
    lostText: 'Perdido',
    expiresInText: 'Expira en',
    tournamentWinningsText: 'Ganancias de Torneos',
    totalWonText: 'Total Ganado',
    withdrawToMXIBalanceText: 'Retirar a Balance MXI',
    transferWinningsToMainBalanceText: 'Transfiere tus ganancias a tu balance principal de MXI para usarlas en compras y otras funciones.',
    amountToWithdrawMXIText: 'Monto a Retirar (MXI)',
    minimum50MXIRequiredText: 'Mínimo 50 MXI',
    invalidAmountEnterValidText: 'Monto Inválido. Por favor ingresa un monto válido',
    minimumWithdrawalIs50Text: 'El retiro mínimo es de 50 MXI',
    insufficientBalanceOnlyHaveText: 'Solo tienes {{available}} MXI disponibles de ganancias de torneos',
    requirementsNotMetNeed5ReferralsText: 'Necesitas 5 referidos activos que hayan comprado el mínimo de MXI.\n\nActualmente tienes: {{count}} referidos activos',
    confirmWithdrawalToMXIBalanceText: 'Confirmar Retiro a Balance MXI',
    doYouWantToTransferFromWinningsText: '¿Deseas transferir {{amount}} MXI de ganancias de torneos a tu balance principal?\n\nEsto te permitirá usar estos MXI para compras y otras funciones.',
    withdrawalSuccessfulTransferredText: '{{amount}} MXI se han transferido a tu balance principal',
    confirmText: 'Confirmar',
    requirementsTitleText: 'Requisitos:',
    activeReferralsText: 'referidos activos',
    minimumText: 'Mínimo',
    availableText2: 'Disponible',
    editProfileText: 'Editar Perfil',
    personalInformationText: 'Información Personal',
    fullNameText: 'Nombre Completo',
    enterYourFullNameText: 'Ingresa tu nombre completo',
    enterFullLegalNameText: 'Ingresa tu nombre legal completo como aparece en tu identificación',
    idNumberText: 'Número de Identificación',
    enterYourIDNumberText: 'Ingresa tu número de identificación',
    enterNationalIDText: 'Ingresa tu cédula nacional, pasaporte o número de licencia de conducir',
    residentialAddressText: 'Dirección Residencial',
    enterYourResidentialAddressText: 'Ingresa tu dirección residencial',
    enterCompleteAddressText: 'Ingresa tu dirección residencial completa',
    emailAddressReadOnlyText: 'Correo Electrónico (Solo lectura)',
    referralCodeReadOnlyText: 'Código de Referido (Solo lectura)',
    saveChangesText: 'Guardar Cambios',
    profileLockedText: 'Perfil Bloqueado',
    profileCannotBeEditedText: 'Tu perfil no puede ser editado porque tu verificación KYC está {{status}}.',
    profileInfoCanOnlyBeModifiedText: 'La información del perfil solo puede modificarse antes de que se apruebe la verificación KYC.',
    backToProfileText: 'Volver al Perfil',
    importantNoticeText: 'Aviso Importante',
    canOnlyEditBeforeKYCText: 'Solo puedes editar la información de tu perfil antes de que se apruebe tu verificación KYC. Asegúrate de que toda la información sea precisa antes de enviar tu KYC.',
    emailAndReferralCannotChangeText: 'Tu dirección de correo electrónico y código de referido no se pueden cambiar. Si necesitas actualizarlos, contacta a soporte.',
    profileUpdatedSuccessfullyText: 'Tu perfil se ha actualizado exitosamente',
    failedToUpdateProfileText: 'Error al actualizar el perfil. Por favor intenta nuevamente.',
    pleaseEnterFullNameText2: 'Por favor ingresa tu nombre completo',
    pleaseEnterAddressText: 'Por favor ingresa tu dirección',
    pleaseEnterIDNumberText: 'Por favor ingresa tu número de identificación',
    idNumberAlreadyRegisteredText: 'Este número de identificación ya está registrado en otra cuenta',
    successText2: 'Éxito',
    errorText2: 'Error',
  },
  pt: {
    // Common
    loading: 'Carregando...',
    save: 'Salvar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    error: 'Erro',
    success: 'Sucesso',
    close: 'Fechar',
    ok: 'OK',
    yes: 'Sim',
    no: 'Não',
    back: 'Voltar',
    next: 'Próximo',
    done: 'Feito',
    edit: 'Editar',
    delete: 'Excluir',
    view: 'Ver',
    share: 'Compartilhar',
    copy: 'Copiar',
    copied: 'Copiado!',
    or: 'ou',
    total: 'Total',
    continue: 'Continuar',
    
    // Auth
    login: 'Entrar',
    register: 'Registrar',
    logout: 'Sair',
    email: 'E-mail',
    password: 'Senha',
    confirmPassword: 'Confirmar Senha',
    name: 'Nome Completo',
    idNumber: 'Número de Identificação',
    address: 'Endereço',
    referralCode: 'Código de Referência (Opcional)',
    alreadyHaveAccount: 'Já tem uma conta?',
    dontHaveAccount: 'Não tem uma conta?',
    signIn: 'Entrar',
    signUp: 'Registrar',
    createAccount: 'Criar Conta',
    forgotPassword: 'Esqueceu a senha?',
    rememberPassword: 'Lembrar senha',
    enterYourEmail: 'seu@email.com',
    enterYourPassword: 'Digite sua senha',
    
    // App Layout
    offlineTitle: '🔌 Você está offline',
    offlineMessage: 'Você pode continuar usando o app! Suas alterações serão salvas localmente e sincronizadas quando você estiver online novamente.',
    standardModalTitle: 'Modal Padrão',
    formSheetModalTitle: 'Folha de Formulário Modal',
    
    // Tabs
    tabHome: 'Início',
    tabProfile: 'Perfil',
    tabDeposit: 'Depositar',
    tabWithdraw: 'Retirar',
    tabReferrals: 'Referências',
    tabTournaments: 'Torneios',
    tabRewards: 'Recompensas',
    tabEcosystem: 'Ecossistema',
    
    // Login Page
    mxiStrategicPresale: 'MXI Strategic PreSale',
    secureYourPosition: 'Garanta Sua Posição no Futuro',
    emailLabel: 'E-mail',
    passwordLabel: 'Senha',
    loginButton: 'Entrar',
    recoverPassword: 'Recuperar Senha',
    contactSupport: 'Contatar Suporte',
    sendEmailTo: 'Envie um e-mail para:',
    pleaseVerifyEmailBeforeLogin: 'Por favor verifique seu e-mail antes de fazer login.',
    resendEmailButton: 'Reenviar E-mail',
    emailVerificationSent: 'E-mail de verificação enviado. Por favor verifique sua caixa de entrada.',
    errorResendingEmail: 'Erro ao reenviar e-mail de verificação',
    recoverPasswordTitle: 'Recuperar Senha',
    recoverPasswordMessage: 'Por favor entre em contato com o suporte técnico para recuperar sua senha.',
    supportEmail: 'support@mxi-strategic.com',
    presaleClosesOn: 'A Pré-Venda fecha em 15 de fevereiro de 2026 às 12:00 UTC',
    
    // Register Page
    joinMXIStrategicPresale: 'Junte-se ao MXI Strategic PreSale',
    fullName: 'Nome Completo',
    minimumSixCharacters: 'Mínimo 6 caracteres',
    reEnterPassword: 'Digite a senha novamente',
    enterReferralCode: 'Digite o código de referência',
    onlyOneAccountPerPerson: 'Apenas uma conta por pessoa é permitida. Seu número de identificação será verificado.',
    iHaveReadAndAccept: 'Li e aceito os',
    termsAndConditions: 'Termos e Condições',
    alreadyHaveAccountLogin: 'Já tem uma conta?',
    termsAndConditionsRequired: 'Termos e Condições Obrigatórios',
    youMustAcceptTerms: 'Você deve aceitar os Termos e Condições para criar uma conta',
    accountCreatedSuccessfully: 'Conta criada com sucesso! Por favor verifique seu e-mail para verificar sua conta antes de fazer login.',
    failedToCreateAccount: 'Falha ao criar conta. Por favor tente novamente.',
    acceptTermsButton: 'Aceitar Termos',
    
    // Terms and Conditions Content (keeping in Portuguese)
    termsContent: `TERMOS E CONDIÇÕES DE USO

MXI STRATEGIC PRESALE – APP VERSION

MAXCOIN (MXI) é uma marca registrada da MXI Strategic Holdings Ltd., Ilhas Cayman.
App operado pela MXI Technologies Inc. (Panamá).
Última atualização: 15/01/2026 – Versão 1.0

1. Aceitação

Ao criar uma conta ou usar o aplicativo MXI Strategic Presale (o "App"), você aceita estes Termos e Condições.
Se você não concordar com eles, não deve usar o App.

2. Sobre MXI

MXI Strategic Holdings Ltd. (Cayman) é a entidade proprietária do token MXI, da marca e da propriedade intelectual.

MXI Technologies Inc. (Panamá) é a empresa operadora do App e responsável por seu funcionamento.

3. Função do App

O App permite:

- Registrar usuários
- Comprar tokens MXI com USDT (via Binance)
- Acessar um sistema de referências
- Ver saldos, rendimentos e movimentos
- Solicitar retiradas de comissões e/ou MXI conforme as regras vigentes

4. Elegibilidade

Para usar o App, você deve:

- Ter mais de 18 anos
- Ter capacidade legal para contratar
- Fornecer dados verdadeiros
- Não viver em países onde as criptomoedas sejam proibidas

5. Registro e Conta

- Apenas uma conta por pessoa é permitida
- É obrigatório completar KYC para habilitar retiradas
- As informações registradas devem coincidir com documentos oficiais
- Os números de identificação não podem se repetir

6. Compra de Tokens MXI

- Mínimo de compra: 50 USDT
- Máximo por usuário: 100.000 USDT
- Pagamento exclusivamente em USDT através da Binance
- O número de tokens recebidos depende da fase da pré-venda

7. Sistema de Referências

Estrutura de comissões:

- Nível 1: 5%
- Nível 2: 2%
- Nível 3: 1%

Requisitos para retirar comissões:

- 5 referências ativas
- 10 dias desde o registro
- KYC aprovado
- Cada referência deve ter feito pelo menos uma compra

8. Rendimentos e Vesting

- Rendimento: 0,005% por hora
- Comissões unificadas também geram rendimento
- Rendimentos não aumentam o vesting
- São necessárias 10 referências ativas para unificar o vesting ao saldo principal

9. Retiradas

9.1 Retiradas de comissões (USDT)

Requisitos:

- 5 referências ativas
- 10 dias de associação
- KYC aprovado
- Carteira USDT válida

9.2 Retiradas de MXI

Requisitos:

- 5 referências ativas
- KYC aprovado

Liberação por fases se o valor exceder 50000 USDT:

- 10% inicial
- +10% a cada 7 dias

10. KYC Obrigatório

Será solicitado:

- Documento oficial válido
- Fotografias
- Selfie (prova de vida)
- Informação verificável

11. Riscos

Investir em criptomoedas envolve riscos:

- Volatilidade extrema
- Perda total ou parcial do capital
- Mudanças regulatórias
- Riscos tecnológicos e de cibersegurança

MXI Strategic não garante lucros nem retornos fixos.

12. Condutas Proibidas

Não é permitido:

- Criar múltiplas contas
- Fornecer dados falsos
- Manipular referências
- Usar o App para atividades ilícitas
- Processar lavagem de dinheiro

13. Limitação de Responsabilidade

O App é oferecido "como está".
Nem MXI Strategic Holdings Ltd. nem MXI Technologies Inc. são responsáveis por:

- Perdas econômicas
- Erros de terceiros ou blockchain
- Danos indiretos ou incidentais
- Uso indevido do App

14. Aceitação Final

Ao se registrar, você declara que:

- Leu e entende estes Termos
- Aceita os riscos
- Fornece informações verdadeiras
- Cumpre com as leis de seu país

15. POLÍTICA DE USO DO TOKEN MXI

O token MXI é um ativo digital em estágio de pré-lançamento, sem valor comercial, sem cotação pública e sem reconhecimento como moeda de curso legal na Colômbia, Espanha, México ou em qualquer outra jurisdição. Seu uso dentro da plataforma é exclusivamente funcional, destinado a recompensas internas, participação em atividades gamificadas e acesso a benefícios do ecossistema MXI.

MXI não representa investimentos, direitos de propriedade, rentabilidade garantida, participação acionária, instrumentos financeiros, valores negociáveis ou produtos similares. Os usuários aceitam que o uso do token é experimental, sujeito a mudanças e dependente de processos de validação técnica e regulatória.

Qualquer futuro valor, convertibilidade ou listagem do token dependerá de condições externas à empresa, processos regulatórios e decisões de mercado que não podem ser garantidas. A plataforma não assegura benefícios econômicos, apreciação ou rendimento algum associado ao MXI.

16. ANEXO LEGAL – JOGOS E RECOMPENSAS MXI

As dinâmicas disponíveis dentro da plataforma (incluindo desafios, minijogos como tap, clicker, "AirBall", desafios de habilidade e a modalidade "Bonus MXI") são baseadas exclusivamente na destreza, rapidez, precisão ou participação ativa do usuário, e não dependem do acaso para determinar resultados.

Nenhuma atividade oferecida deve ser interpretada como:

- jogo de azar,
- aposta,
- sorteio com fins lucrativos,
- rifas reguladas,
- loterias estatais ou privadas,
- ou mecanismos equivalentes regulados na Colômbia, Espanha ou México.

O acesso a essas dinâmicas pode requerer um pagamento simbólico em MXI, mas tal pagamento não constitui uma aposta, já que o token não possui valor econômico real e é usado apenas como mecanismo interno de participação.

A modalidade "Bonus MXI", incluindo alocação aleatória de prêmios, é realizada fora da plataforma principal, através de processos independentes, transparentes e verificáveis, cujo objetivo é distribuir recompensas promocionais em MXI sem que isso constitua um jogo de azar regulado.

Os usuários aceitam que as recompensas concedidas são promocionais, digitais e sem valor comercial, e que a participação em qualquer dinâmica não garante ganhos econômicos reais.

---

**IMPORTANTE**: Estes termos e condições são legalmente vinculantes. Se você não concordar com qualquer parte, não deve usar o Aplicativo. É recomendável consultar um assessor legal ou financeiro antes de fazer investimentos em criptomoedas.

**Data de vigência**: 15 de Janeiro de 2026
**Versão**: 1.0`,
    
    // Home
    hello: 'Olá',
    welcomeToMXI: 'Bem-vindo ao MXI Pool',
    phasesAndProgress: '🚀 Fases e Progresso',
    currentPhase: 'Fase Atual',
    phase: 'Fase',
    sold: 'Vendidos',
    remaining: 'Restantes',
    generalProgress: '📈 Progresso Geral',
    of: 'de',
    totalMXIDelivered: '💰 Total MXI Entregues',
    mxiDeliveredToAllUsers: 'MXI entregues a todos os usuários (compras + comissões + desafios + vesting)',
    poolClose: 'Fechamento do Pool',
    perMXI: 'por MXI',
    
    // Launch Countdown
    officialLaunch: 'LANÇAMENTO OFICIAL',
    maxcoinMXI: 'Maxcoin (MXI)',
    poolActive: 'Pool Ativo',
    vestingRealTime: 'Vesting Tempo Real',
    days: 'DIAS',
    hours: 'HRS',
    minutes: 'MIN',
    seconds: 'SEG',
    launchDate: '15 Fev 2026 • 12:00 UTC',
    
    // Total MXI Balance Chart
    totalMXIBalance: '📊 Saldo Total de MXI',
    allSourcesIncluded: 'Todas as fontes incluídas',
    chartShowsTotalBalance: 'Este gráfico mostra seu saldo TOTAL de MXI incluindo: compras diretas, comissões, torneios e vesting. O vesting é gerado APENAS do MXI comprado diretamente.',
    generatingChartData: 'Gerando dados do gráfico...',
    loadingChart: 'Carregando gráfico...',
    mxiTotal: 'MXI Total',
    purchased: 'Comprados',
    commissions: 'Comissões',
    tournaments: 'Torneios',
    vesting: 'Vesting',
    completeBreakdown: '📊 Detalhamento Completo de MXI',
    mxiPurchased: 'MXI Comprados',
    mxiCommissions: 'MXI Comissões',
    mxiTournaments: 'MXI Torneios',
    vestingRealTimeLabel: 'Vesting (Tempo Real)',
    updatingEverySecond: 'Atualizando a cada segundo',
    
    // Yield Display
    vestingMXI: '🔥 Vesting MXI (Mineração Ativa)',
    generatingPerSecond: '⚡ Gerando {{rate}} MXI por segundo',
    mxiPurchasedVestingBase: '🛒 MXI Comprados (Base de Vesting)',
    onlyPurchasedMXIGeneratesVesting: 'ℹ️ Apenas o MXI comprado gera rendimento de vesting',
    currentSession: '💰 Sessão Atual',
    totalAccumulated: '📊 Total Acumulado',
    perSecond: 'Por Segundo',
    perMinute: 'Por Minuto',
    perHour: 'Por Hora',
    dailyYield: '📈 Rendimento Diário',
    claimYield: '💎 Reivindicar Rendimento',
    claiming: 'Reivindicando...',
    yieldInfo: 'Taxa de mineração: 0.005% por hora do seu MXI comprado. Apenas o MXI comprado diretamente gera rendimento de vesting. As comissões NÃO geram vesting. Para reivindicar seu MXI minerado, você precisa de 5 referências ativas, 10 dias de associação e aprovação KYC. Lembre-se que para vesting você deve ter 10 referências ativas e será desbloqueado uma vez que o token seja lançado e listado nas exchanges.',
    noYield: 'Sem Rendimento',
    needMoreYield: 'Você precisa acumular mais rendimento antes de reivindicar.',
    requirementsNotMet: 'Requisitos Não Atendidos',
    claimRequirements: 'Para reivindicar seu MXI minerado, você precisa:\n\n- 5 referências ativas (você tem {{count}})\n- 10 dias de associação\n- Verificação KYC aprovada\n\nUma vez que você atenda a esses requisitos, poderá reivindicar seu rendimento acumulado.',
    kycRequired: 'KYC Necessário',
    kycRequiredMessage: 'Você precisa completar a verificação KYC antes de reivindicar seu MXI minerado. Por favor vá à seção KYC para verificar sua identidade.',
    yieldClaimed: 'Rendimento Reivindicado!',
    yieldClaimedMessage: 'Você reivindicou com sucesso {{amount}} MXI e foi adicionado ao seu saldo de vesting!',
    claimFailed: 'Reivindicação Falhou',
    
    // Deposit Page
    deposit: 'Depositar',
    buyMXIWithMultipleOptions: 'Compre MXI com múltiplas opções de pagamento',
    currentBalance: 'Saldo Atual',
    usdtContributed: 'USDT Contribuído',
    currentPresalePhase: '🚀 Fase Atual de Pré-Venda',
    activePhase: 'Fase Ativa',
    phaseOf: 'Fase {{current}} de {{total}}',
    currentPrice: 'Preço Atual',
    tokensSold: 'Tokens Vendidos',
    untilNextPhase: 'Até Próxima Fase',
    paymentOptions: '💳 Opções de Pagamento',
    chooseYourPreferredPaymentMethod: 'Escolha seu método de pagamento preferido',
    multiCryptoPayment: 'Pagamento Multi-Cripto',
    availableCryptocurrencies: '+50 Criptomoedas Disponíveis',
    bitcoinEthereumUSDTUSDC: 'Bitcoin, Ethereum, USDT, USDC',
    multipleNetworks: 'Múltiplas Redes (ETH, BSC, TRX, SOL)',
    automaticConfirmation: 'Confirmação Automática',
    directUSDTPayment: 'Pagamento Direto USDT',
    manualUSDTTransfer: 'Transferência Manual de USDT',
    usdtOnMultipleNetworks: 'USDT em múltiplas redes',
    manualVerificationAvailable: 'Verificação manual disponível',
    dedicatedSupport: 'Suporte dedicado',
    manualPaymentVerification: 'Verificação Manual de Pagamentos',
    requestManualVerificationOfPayments: 'Solicite verificação manual de seus pagamentos NowPayments e USDT',
    completePaymentHistory: 'Histórico completo de pagamentos',
    verificationByAdministrator: 'Verificação por administrador',
    responseInLessThan2Hours: 'Resposta em menos de 2 horas',
    transactionHistory: 'Histórico de Transações',
    viewVerifyAndManageYourPayments: 'Ver, verificar e gerenciar seus pagamentos',
    supportedCryptocurrencies: '🪙 Criptomoedas Suportadas',
    payWithAnyOfTheseCoinsAndMore: 'Pague com qualquer uma dessas moedas e mais',
    bitcoin: 'Bitcoin',
    ethereum: 'Ethereum',
    usdt: 'USDT',
    usdc: 'USDC',
    bnb: 'BNB',
    solana: 'Solana',
    litecoin: 'Litecoin',
    more50Plus: '+50 mais',
    howItWorks: '📋 Como Funciona',
    chooseYourPaymentMethod: 'Escolha seu Método de Pagamento',
    selectBetweenMultiCryptoOrDirectUSDT: 'Selecione entre pagamento multi-cripto ou transferência direta USDT',
    enterTheAmount: 'Digite o Valor',
    specifyHowMuchUSDTYouWantToInvest: 'Especifique quanto USDT deseja investir (mínimo 2 USDT)',
    makeThePayment: 'Realize o Pagamento',
    sendTheExactAmountToTheProvidedAddress: 'Envie o valor exato para o endereço fornecido',
    receiveYourMXI: 'Receba seus MXI',
    tokensWillBeCreditedAutomatically: 'Os tokens serão creditados automaticamente após a confirmação',
    advantagesOfOurPaymentSystem: '✨ Vantagens do Nosso Sistema de Pagamentos',
    automaticConfirmationInMinutes: 'Confirmação automática em minutos',
    secureAndVerifiedOnBlockchain: 'Seguro e verificado na blockchain',
    multiplePaymentOptionsAvailable: 'Múltiplas opções de pagamento disponíveis',
    available247WithoutIntermediaries: 'Disponível 24/7 sem intermediários',
    quickStats: 'Estatísticas Rápidas',
    paymentMethods: 'Métodos de Pagamento',
    cryptocurrencies: 'Criptomoedas',
    available247: 'Disponível 24/7',
    
    // Withdrawals Page
    withdrawals: 'Retiradas',
    withdraw: 'Retirar',
    loadingData: 'Carregando dados...',
    updatingBalances: 'Atualizando saldos...',
    mxiAvailable: 'MXI Disponíveis',
    totalMXI: 'Total MXI',
    approximateUSDT: '≈ {{amount}} USDT',
    mxiPurchasedLabel: 'MXI Comprados',
    lockedUntilLaunch: '🔒 Bloqueado até lançamento',
    mxiCommissionsLabel: 'MXI Comissões',
    availableLabel: '✅ Disponível',
    mxiVestingLabel: 'MXI Vesting',
    realTime: 'Tempo Real',
    mxiTournamentsLabel: 'MXI Torneios',
    withdrawalType: 'Tipo de Retirada',
    withdrawMXIPurchased: 'Retirar MXI Comprados',
    mxiAcquiredThroughUSDTPurchases: 'MXI adquiridos através de compras com USDT',
    withdrawMXICommissions: 'Retirar MXI Comissões',
    mxiFromReferralCommissions: 'MXI de comissões de referências',
    withdrawMXIVesting: 'Retirar MXI Vesting',
    mxiGeneratedByYield: 'MXI gerado por rendimento (3% mensal)',
    withdrawMXITournaments: 'Retirar MXI Torneios',
    mxiWonInTournamentsAndChallenges: 'MXI ganho em torneios e desafios',
    withdrawalDetails: 'Detalhes da Retirada',
    withdrawalsInUSDTETH: '⚠️ As retiradas são feitas em USDT(ETH). Digite o valor em MXI.',
    amountMXI: 'Quantidade (MXI)',
    maximum: 'Máximo',
    walletAddressETH: 'Endereço da Carteira (ETH)',
    enterYourETHWalletAddress: 'Digite seu endereço de carteira ETH',
    requestWithdrawal: 'Solicitar Retirada',
    amountInMXI: 'Quantidade em MXI:',
    equivalentInUSDT: 'Equivalente em USDT:',
    rate: 'Taxa: 1 MXI = 0.4 USDT',
    withdrawalRequirements: '📋 Requisitos de Retirada',
    kycApproved: 'KYC Aprovado',
    activeReferralsForGeneralWithdrawals: '5 Referências Ativas para retiradas gerais ({{count}}/5)',
    activeReferralsForVestingWithdrawals: '10 Referências Ativas para retiradas de Vesting ({{count}}/10)',
    mxiLaunchRequiredForPurchasedAndVesting: 'Lançamento de MXI necessário para retiradas de MXI comprados e vesting',
    importantInformation: 'Informação Importante',
    withdrawalsInUSDTETHInfo: '- Retiradas em USDT(ETH): Todas as retiradas são processadas em USDT na rede Ethereum',
    conversionInfo: '- Conversão: 1 MXI = 0.4 USDT',
    mxiCommissionsInfo: '- MXI Comissões: Disponíveis para retirada imediata (requer 5 referências ativas + KYC)',
    mxiTournamentsInfo: '- MXI Torneios: Disponíveis para retirada da mesma forma que as comissões',
    mxiVestingInfo: '- MXI Vesting: Requer 10 referências com compras de MXI + lançamento oficial',
    mxiPurchasedInfo: '- MXI Comprados: Bloqueados até o lançamento oficial de MXI',
    realTimeUpdateInfo: '- Atualização em Tempo Real: Os saldos de vesting são atualizados a cada segundo',
    processingTime: '- Tempo de processamento: 24-48 horas',
    verifyWalletAddress: '- Verifique cuidadosamente o endereço da carteira ETH',
    viewWithdrawalHistory: 'Ver Histórico de Retiradas',
    invalidAmount: 'Quantidade Inválida',
    pleaseEnterValidAmount: 'Por favor digite uma quantidade válida',
    missingInformation: 'Informação Faltando',
    pleaseEnterYourWalletAddress: 'Por favor digite seu endereço de carteira',
    insufficientBalance: 'Saldo Insuficiente',
    youDoNotHaveEnoughAvailable: 'Você não tem {{type}} suficiente disponível',
    requirementNotMet: 'Requisito Não Atendido',
    youNeedAtLeast10ActiveReferrals: 'Você precisa de pelo menos 10 referências ativas com compras de MXI para retirar Vesting.\n\nAtualmente você tem: {{count}} referências ativas.',
    withdrawalNotAvailable: 'Retirada Não Disponível',
    withdrawalsWillBeAvailableAfterLaunch: 'As retiradas de {{type}} estarão disponíveis após o lançamento oficial de MXI.\n\nTempo restante: {{days}} dias',
    notEligible: 'Não Elegível',
    youNeedAtLeast5ActiveReferrals: 'Você precisa de pelo menos 5 referências ativas e KYC aprovado para retirar',
    confirmWithdrawal: 'Confirmar Retirada',
    youAreAboutToWithdraw: 'Você está prestes a retirar:\n\n{{amount}} MXI ({{type}})\n≈ {{usdt}} USDT\n\nTaxa de conversão: 1 MXI = 0.4 USDT\n\nDeseja continuar?',
    requestSent: 'Solicitação Enviada',
    yourWithdrawalRequestHasBeenSent: 'Sua solicitação de retirada foi enviada com sucesso:\n\n{{amount}} MXI ({{type}})\n≈ {{usdt}} USDT (ETH)\n\nSerá processada em 24-48 horas.',
    withdrawalError: 'Erro de Retirada',
    couldNotProcessWithdrawal: 'Não foi possível processar a retirada. Por favor tente novamente.',
    errorProcessingWithdrawal: 'Ocorreu um erro ao processar a retirada',
    withdrawalHistory: 'Histórico de Retiradas',
    
    // Referrals Page
    referrals: 'Referências',
    myReferrals: 'Minhas Referências',
    referralSystem: 'Sistema de Referências',
    yourReferralCode: 'Seu Código de Referência',
    shareCode: 'Compartilhar Código',
    commissionBalance: 'Saldo de Comissões (MXI)',
    totalEarned: 'Total Ganho',
    available: 'Disponível',
    level: 'Nível',
    activeReferrals: 'Referências Ativas',
    howReferralsWork: 'Como Funcionam as Referências',
    allCommissionsInMXI: 'Todas as comissões são gerenciadas internamente em MXI',
    withdrawToBalanceMXI: 'Retirar para Saldo MXI',
    transferCommissionsDescription: 'Transfira suas comissões para seu saldo principal de MXI para usá-las em compras e outras funções.',
    withdrawToBalance: 'Retirar para Saldo',
    amountToWithdraw: 'Valor a Retirar (MXI)',
    minimum50MXI: 'Mínimo 50 MXI',
    availableAmount: 'Disponível',
    requirements: 'Requisitos',
    activeReferralsRequired: 'referências ativas necessárias',
    minimumAmount: 'Mínimo',
    yourReferrals: 'Suas Referências',
    activeReferralsLevel1: 'Referências Ativas (Nível 1)',
    shareReferralCode: 'Compartilhe seu código de referência com amigos',
    earn5PercentLevel1: 'Ganhe 5% em MXI de referências de Nível 1',
    earn2PercentLevel2: 'Ganhe 2% em MXI de referências de Nível 2',
    earn1PercentLevel3: 'Ganhe 1% em MXI de referências de Nível 3',
    allCommissionsCreditedMXI: 'Todas as comissões são creditadas diretamente em MXI',
    need5ActiveReferrals: 'Precisa de 5 referências ativas de Nível 1 para retirar',
    minimumWithdrawal: 'Retirada Mínima',
    minimumWithdrawalIs50MXI: 'A retirada mínima é de 50 MXI',
    youOnlyHaveAvailable: 'Você só tem',
    availableFromCommissions: 'disponíveis de comissões',
    youNeed5ActiveReferrals: 'Você precisa de 5 referências ativas que tenham comprado o mínimo de MXI.',
    currentlyYouHave: 'Atualmente você tem:',
    confirmWithdrawalToBalance: 'Confirmar Retirada para Saldo MXI',
    doYouWantToTransfer: 'Deseja transferir',
    fromCommissionsToMainBalance: 'de comissões para seu saldo principal?',
    thisWillAllowYouToUse: 'Isso permitirá que você use esses MXI para compras e outras funções.',
    withdrawalSuccessful: 'Retirada Bem-Sucedida',
    transferredToMainBalance: 'foram transferidos para seu saldo principal',
    referralsText: 'referências',
    couldNotCompleteWithdrawal: 'Não foi possível completar a retirada',
    unexpectedError: 'Ocorreu um erro inesperado',
    commissionsByReferrals: 'Comissões por Referências',
    totalEarnedByReferrals: 'Total Ganho por Referências',
    howCommissionsWork: 'Como Funcionam as Comissões',
    commissionsCalculatedOnMXI: 'As comissões são calculadas sobre o valor em MXI comprado',
    commissionsAutomaticallyCredited: 'As comissões são creditadas automaticamente em MXI',
    requirementsToWithdraw: 'Requisitos para Retirar',
    
    // Tournaments Page
    tournamentsTitle: 'Torneios',
    availableGames: 'Jogos Disponíveis',
    distributionOfRewards: 'Distribuição de Recompensas',
    winner: 'Vencedor',
    prizeFund: 'Fundo de Prêmios',
    onlyUseCommissionsOrChallenges: 'Você só pode usar MXI de comissões ou desafios ganhos',
    players: 'Jogadores',
    joiningGame: 'Entrando no jogo...',
    selectPlayers: 'Selecionar Jogadores',
    asFirstPlayerChoosePlayers: 'Como primeiro jogador, escolha quantos jogadores participarão deste torneio:',
    createTournamentOf: 'Criar Torneio de {{count}} Jogadores',
    participateFor: 'Participar por {{fee}} MXI?',
    prize: 'Prêmio',
    insufficientBalanceNeed: 'Você precisa de {{needed}} MXI. Você tem {{available}} MXI disponível.',
    
    // Rewards Page
    rewards: 'Recompensas',
    earnMXIMultipleWays: 'Ganhe MXI de múltiplas formas',
    loadingRewards: 'Carregando recompensas...',
    totalMXIEarned: 'Total MXI Ganho',
    bonus: 'Bônus',
    rewardPrograms: 'Programas de Recompensas',
    participationBonus: 'Bônus de Participação',
    participateInWeeklyDrawings: 'Participe de sorteios semanais e ganhe grandes prêmios',
    active: 'Ativo',
    vestingAndYield: 'Vesting e Rendimento',
    generatePassiveIncome: 'Gere rendimento passivo automaticamente',
    live: 'Ao Vivo',
    earnCommissionsFrom3Levels: 'Ganhe comissões de 3 níveis por indicar amigos',
    actives: 'ativos',
    moreRewardsComingSoon: 'Mais Recompensas em Breve',
    workingOnNewRewards: 'Estamos trabalhando em novos programas de recompensas emocionantes:',
    tournamentsAndCompetitions: 'Torneios e competições',
    achievementBonuses: 'Bônus por conquistas',
    loyaltyRewards: 'Recompensas por fidelidade',
    specialEvents: 'Eventos especiais',
    benefitsOfRewards: 'Benefícios das Recompensas',
    earnAdditionalMXI: 'Ganhe tokens MXI adicionais sem investimento extra',
    participateInExclusiveDrawings: 'Participe de sorteios exclusivos com grandes prêmios',
    generateAutomaticPassiveIncome: 'Gere rendimento passivo automático 24/7',
    bonusesForActiveReferrals: 'Bônus por referências ativas de até 3 níveis',
    rewardsForContinuedParticipation: 'Recompensas por participação contínua',
    maximizeYourRewards: 'Maximize Suas Recompensas',
    keepAtLeast5ActiveReferrals: 'Mantenha pelo menos 5 referências ativas para desbloquear retiradas',
    participateRegularlyInBonus: 'Participe regularmente no bônus de participação para aumentar suas chances',
    activateVestingForPassiveIncome: 'Ative o vesting para gerar rendimento passivo contínuo',
    shareYourReferralCodeSocial: 'Compartilhe seu código de referência nas redes sociais',
    
    // Ecosystem Page
    ecosystem: '🌐 Ecossistema MXI',
    liquidityPool: 'Pool de Liquidez Maxcoin',
    whatIsMXI: 'O que é MXI? 💎',
    howItWorksTab: 'Como funciona? 🚀',
    whyBuy: 'Por que comprar? 💰',
    meta: 'META 🎯',
    ecosystemTab: 'Ecossistema 🌱',
    quantumSecurity: 'Segurança Quântica 🔐',
    sustainability: 'Sustentabilidade ♻️',
    dailyVesting: 'Vesting Diário 💎',
    inPractice: 'Na prática 📊',
    tokenomics: 'Tokenômica 🪙',
    
    // Profile Page
    profile: 'Perfil',
    editProfile: 'Editar Perfil',
    updateYourInformation: 'Atualize suas informações',
    completeYourIdentityVerification: 'Complete sua verificação de identidade',
    viewPreviousWithdrawals: 'Ver retiradas anteriores',
    
    // Language
    language: 'Idioma',
    selectLanguage: 'Selecionar Idioma',
    english: 'Inglês',
    spanish: 'Espanhol',
    portuguese: 'Português',
    
    // KYC
    kycVerification: 'Verificação KYC',
    kycStatus: 'Status KYC',
    approved: 'Aprovado',
    pending: 'Pendente',
    rejected: 'Rejeitado',
    notSubmitted: 'Não Enviado',
    completeYourKYCVerification: 'Complete sua verificação de identidade',
    verificationStatus: 'Status de Verificação',
    verifiedOn: 'Verificado em',
    yourKYCIsBeingReviewed: 'Sua verificação KYC está sendo revisada. Isso normalmente leva 24-48 horas.',
    rejectionReason: 'Motivo da Rejeição',
    pleaseCorrectIssues: 'Por favor corrija os problemas mencionados e reenvie sua verificação.',
    whyKYCRequired: 'Por que o KYC é necessário:',
    kycMandatoryForWithdrawals: 'A verificação KYC é obrigatória para todas as retiradas',
    helpPreventFraud: 'Ajuda a prevenir fraude e lavagem de dinheiro',
    ensureCompliance: 'Garante conformidade com regulamentações financeiras',
    protectYourAccount: 'Protege sua conta e fundos',
    oneTimeVerification: 'Processo de verificação único',
    personalInformation: 'Informação Pessoal',
    fullLegalName: 'Nome Legal Completo',
    enterFullNameAsOnID: 'Digite seu nome completo como aparece em seu ID',
    documentType: 'Tipo de Documento',
    nationalID: 'Carteira de Identidade',
    passport: 'Passaporte',
    driversLicense: 'Carteira de Motorista',
    documentNumber: 'Número do Documento',
    enterYourDocumentNumber: 'Digite seu número de documento',
    frontDocument: 'Documento Frontal *',
    uploadClearPhotoOfFront: 'Envie uma foto clara da frente do seu documento de identidade',
    uploading: 'Enviando...',
    tapToChange: 'Toque para alterar',
    tapToUploadFront: 'Toque para enviar frente',
    backDocument: 'Documento Traseiro *',
    uploadClearPhotoOfBack: 'Envie uma foto clara do verso do seu documento de identidade',
    tapToUploadBack: 'Toque para enviar verso',
    submitting: 'Enviando...',
    submitKYCVerification: 'Enviar Verificação KYC',
    yourDataIsSecure: 'Seus Dados estão Seguros',
    dataEncryptedAndSecure: 'Todas as informações pessoais e documentos estão criptografados e armazenados de forma segura. Cumprimos com regulamentações internacionais de proteção de dados e nunca compartilharemos suas informações com terceiros sem seu consentimento.',
    kycVerified: 'KYC Verificado!',
    identityVerifiedSuccessfully: 'Sua identidade foi verificada com sucesso. Agora você pode retirar seus fundos uma vez que atenda a todos os outros requisitos.',
    kycSubmittedSuccessfully: 'KYC Enviado com Sucesso',
    kycUnderReview: 'Sua verificação KYC foi enviada e está sob revisão. Você será notificado assim que for processada (normalmente dentro de 24-48 horas).',
    submissionError: 'Erro de Envio',
    errorSubmittingKYC: 'Erro ao enviar verificação KYC. Por favor tente novamente ou entre em contato com o suporte se o problema persistir.',
    
    // Balance
    balance: 'Saldo',
    totalBalance: 'Saldo Total',
    mxiFromVesting: 'MXI de Vesting',
    mxiFromTournaments: 'MXI de Torneios',
    mxiBalance: 'Saldo MXI',
    currentBalance: 'Saldo Atual',
    internalSimulatedBalance: 'Saldo interno simulado',
    aboutYourMXIBalance: 'Sobre seu Saldo MXI',
    thisIsYourInternalBalance: 'Este é seu saldo interno de MXI obtido através de pagamentos em USDT ERC20',
    conversionRate: 'Taxa de conversão: 1 USDT = 2.5 MXI',
    paymentsVerifiedAutomatically: 'Os pagamentos são verificados automaticamente na blockchain Ethereum',
    requiresThreeConfirmations: 'São necessárias pelo menos 3 confirmações para creditar o saldo',
    quickActions: 'Ações Rápidas',
    addBalance: 'Adicionar Saldo',
    payWithUSDT: 'Pagar com USDT ERC20',
    viewTransactions: 'Ver transações',
    
    // Vesting
    vesting: 'Vesting',
    yieldGeneration: 'Geração de Rendimento',
    viewYieldGeneration: 'Ver geração de rendimento',
    vestingSource: '⚠️ Fonte de Vesting',
    vestingSourceDescription: 'O vesting é gerado APENAS do MXI comprado diretamente com USDT. As comissões NÃO geram vesting. Este gráfico representa o crescimento pessoal do usuário em MXI: compras, despesas, perdas, etc.',
    mxiPurchasedBase: 'MXI Comprado (Base de Vesting)',
    mxiInVesting: 'MXI em Vesting',
    availableForWithdrawal: 'Disponível para retirada uma vez que a moeda seja lançada',
    blockedUntilLaunch: 'Bloqueado até o lançamento oficial',
    daysRemaining: 'dias',
    balanceBlocked: 'Saldo Bloqueado',
    balanceBlockedDescription: 'O saldo de vesting não pode ser unificado ou retirado até que a moeda seja oficialmente lançada. Uma vez lançada, você poderá retirar seu saldo cumprindo os requisitos de retirada (5 referências ativas e KYC aprovado).',
    timeUntilLaunch: 'Tempo até o lançamento:',
    released: 'Liberado',
    releasePercentage: 'Porcentagem de liberação:',
    releasesCompleted: 'Liberações realizadas:',
    nextRelease: 'Próxima liberação:',
    withdrawalStatus: 'Status de retirada:',
    enabled: 'Habilitado',
    blockedUntilLaunchShort: 'Bloqueado até lançamento',
    whatIsVesting: 'O que é Vesting?',
    vestingDescription: 'O vesting é um mecanismo que libera gradualmente seus tokens MXI obtidos através de yield/rendimento do MXI comprado. Isso garante estabilidade no mercado e protege o valor da moeda.',
    vestingReleaseInfo: 'A cada 10 dias, {{percentage}}% do seu saldo em vesting é liberado, que você pode retirar uma vez que atenda aos requisitos (5 referências ativas e KYC aprovado).',
    vestingReleaseInfoPreLaunch: 'Uma vez que a moeda seja lançada, a cada 10 dias {{percentage}}% do seu saldo em vesting será liberado para retirada.',
    vestingImportantNote: '⚠️ Importante: Apenas o MXI comprado diretamente gera rendimento de vesting. As comissões NÃO geram vesting. O gráfico "Saldo MXI" mostra seu crescimento pessoal em MXI, não o vesting em si.',
    withdrawMXI: 'Retirar MXI',
    withdrawVestingBalance: 'Retire seu saldo de vesting liberado',
    vestingInformation: 'Informação de Vesting',
    everyTenDays: 'a cada 10 dias',
    
    // Support
    support: 'Suporte',
    getHelp: 'Obter Ajuda',
    getAssistanceFromOurTeam: 'Obtenha assistência de nossa equipe',
    newSupportRequest: 'Nova Solicitação de Suporte',
    category: 'Categoria',
    general: 'Geral',
    kyc: 'KYC',
    withdrawal: 'Retirada',
    transaction: 'Transação',
    technical: 'Técnico',
    other: 'Outro',
    subject: 'Assunto',
    briefDescriptionOfIssue: 'Breve descrição do seu problema',
    message: 'Mensagem',
    describeYourIssueInDetail: 'Descreva seu problema em detalhes...',
    sendMessage: 'Enviar Mensagem',
    yourMessageHasBeenSent: 'Sua mensagem foi enviada. Nossa equipe de suporte responderá em breve.',
    failedToSendMessage: 'Falha ao enviar mensagem',
    noMessagesYet: 'Ainda não há mensagens',
    createSupportRequest: 'Crie uma solicitação de suporte para obter ajuda de nossa equipe',
    messageDetail: 'Visualização de detalhes da mensagem em breve',
    replies: 'respostas',
    
    // Challenges
    challengeHistory: 'Histórico de Desafios',
    viewGameRecords: 'Ver registros de jogos',
    all: 'Todos',
    wins: 'Vitórias',
    losses: 'Derrotas',
    noHistoryYet: 'Sem Histórico Ainda',
    challengeHistoryWillAppear: 'Seu histórico de desafios aparecerá aqui uma vez que você participe de jogos',
    score: 'Pontuação',
    rank: 'Classificação',
    won: 'Ganho',
    lost: 'Perdido',
    expiresIn: 'Expira em',
    tournamentWinnings: 'Ganhos de Torneios',
    totalWon: 'Total Ganho',
    withdrawToMXIBalance: 'Retirar para Saldo MXI',
    transferWinningsToMainBalance: 'Transfira seus ganhos para seu saldo principal de MXI para usá-los em compras e outras funções.',
    amountToWithdrawMXI: 'Valor a Retirar (MXI)',
    minimum50MXIRequired: 'Mínimo 50 MXI',
    invalidAmountEnterValid: 'Valor Inválido. Por favor digite um valor válido',
    minimumWithdrawalIs50: 'A retirada mínima é de 50 MXI',
    insufficientBalanceOnlyHave: 'Você só tem {{available}} MXI disponíveis de ganhos de torneios',
    requirementsNotMetNeed5Referrals: 'Você precisa de 5 referências ativas que tenham comprado o mínimo de MXI.\n\nAtualmente você tem: {{count}} referências ativas',
    confirmWithdrawalToMXIBalance: 'Confirmar Retirada para Saldo MXI',
    doYouWantToTransferFromWinnings: 'Deseja transferir {{amount}} MXI de ganhos de torneios para seu saldo principal?\n\nIsso permitirá que você use esses MXI para compras e outras funções.',
    withdrawalSuccessfulTransferred: '{{amount}} MXI foram transferidos para seu saldo principal',
    
    // Lottery/Bonus
    loadingBonus: 'Carregando bônus...',
    noActiveBonusRound: 'Nenhuma rodada de bônus ativa',
    retry: 'Tentar Novamente',
    round: 'Rodada',
    open: 'Aberto',
    locked: 'Bloqueado',
    prizePool: 'Poço de Prêmios (90%)',
    totalPool: 'Poço Total',
    ticketsSold: 'Bilhetes Vendidos',
    ticketPrice: 'Preço do Bilhete',
    yourTickets: 'Seus Bilhetes',
    availableMXI: 'MXI Disponível',
    purchaseTickets: 'Comprar Bilhetes',
    buyBetween1And20Tickets: 'Compre entre 1 e 20 bilhetes. Máximo 20 bilhetes por usuário por rodada.',
    buyTickets: 'Comprar Bilhetes',
    numberOfTickets: 'Número de Bilhetes (1-20)',
    enterQuantity: 'Digite a quantidade',
    tickets: 'Bilhetes',
    pricePerTicket: 'Preço por bilhete',
    totalCost: 'Custo Total',
    selectPaymentSource: 'Selecionar Fonte de Pagamento',
    chooseWhichMXIBalance: 'Escolha qual saldo de MXI usar para esta compra',
    mxiPurchasedSource: 'MXI Comprados',
    mxiFromCommissionsSource: 'MXI de Comissões',
    mxiFromChallengesSource: 'MXI de Desafios',
    howItWorksBonus: 'Como Funciona',
    eachTicketCosts2MXI: 'Cada bilhete custa 2 MXI',
    buyBetween1And20TicketsPerRound: 'Compre entre 1 e 20 bilhetes por rodada',
    roundLocksWhen1000TicketsSold: 'A rodada bloqueia quando 1000 bilhetes são vendidos',
    winnerReceives90Percent: 'O vencedor recebe 90% do poço total',
    winnerAnnouncedOnSocialMedia: 'O vencedor é anunciado nas redes sociais',
    purchaseIsFinalNoRefunds: 'A compra é final - sem reembolsos',
    insufficientBalanceNeedForTickets: 'Você precisa de {{needed}} MXI para comprar {{quantity}} bilhete(s).\n\nSeu saldo disponível para desafios é {{available}} MXI.\n\nO MXI disponível inclui:\n- MXI comprados diretamente\n- MXI de comissões unificadas\n- MXI de ganhos de desafios',
    insufficientBalanceInSource: 'Seu saldo de {{source}} ({{available}} MXI) não é suficiente para cobrir o custo ({{needed}} MXI).',
    successfullyPurchasedTickets: 'Comprou com sucesso {{count}} bilhete(s) por {{cost}} MXI usando {{source}}!',
    failedToPurchaseTickets: 'Falha ao comprar bilhetes',
    
    // USDT Payment Page
    payInUSDT: 'Pagar em USDT',
    selectPaymentNetwork: 'Selecione a Rede de Pagamento',
    eachNetworkValidatesIndependently: 'Cada rede valida suas transações de forma independente',
    networkDescription: 'Rede {{network}} - Validação independente',
    validationIn: 'Validação em {{network}}',
    paymentsOnlyValidatedOnNetwork: 'Os pagamentos em {{network}} são validados apenas na rede {{network}}',
    paymentInstructions: 'Instruções de Pagamento',
    selectNetworkYouWillUse: 'Selecione a rede que você vai usar ({{label}})',
    sendUSDTFromAnyWallet: 'Envie USDT de qualquer carteira para o endereço receptor',
    minimumAmountLabel: 'Valor mínimo: {{min}} USDT',
    copyTransactionHash: 'Copie o hash da transação (txHash)',
    pasteHashAndVerify: 'Cole o txHash aqui e verifique o pagamento',
    youWillReceiveMXI: 'Você receberá MXI = USDT × {{rate}}',
    recipientAddress: 'Endereço Receptor ({{label}})',
    addressCopied: 'Endereço copiado para a área de transferência',
    onlySendUSDTOnNetwork: '⚠️ Envie apenas USDT na rede {{network}} ({{label}})',
    mxiCalculator: 'Calculadora de MXI',
    transactionHashTxHash: 'Hash de Transação (txHash)',
    pasteYourTransactionHash: 'Cole o hash da sua transação de {{network}} aqui',
    correctLength: '✓ Comprimento correto',
    charactersCount: '⚠️ {{count}}/66 caracteres',
    verifyAutomatically: 'Verificar Automaticamente',
    verifying: 'Verificando...',
    requestManualVerification: 'Solicitar Verificação Manual',
    sendingRequest: 'Enviando solicitação...',
    importantValidationByNetwork: '⚠️ Importante - Validação por Rede',
    eachNetworkValidatesIndependentlyInfo: 'Cada rede valida suas transações de forma independente',
    paymentsOnETHOnlyValidatedOnETH: 'Os pagamentos em ETH são validados apenas na rede Ethereum',
    paymentsOnBNBOnlyValidatedOnBNB: 'Os pagamentos em BNB são validados apenas na rede BNB Chain',
    paymentsOnPolygonOnlyValidatedOnPolygon: 'Os pagamentos em Polygon são validados apenas na rede Polygon',
    ensureCorrectNetworkBeforeVerifying: 'Certifique-se de selecionar a rede correta antes de verificar',
    transactionMustHave3Confirmations: 'A transação deve ter pelo menos 3 confirmações',
    cannotUseSameHashTwice: '⚠️ VOCÊ NÃO PODE USAR O MESMO HASH DUAS VEZES - Sistema anti-duplicados ativo',
    ifAutomaticFailsUseManual: '📋 Se a verificação automática falhar, use a verificação manual',
    pasteHashHere: 'Cole o hash aqui',
    hashInvalid: 'Hash Inválido',
    hashMustStartWith0x: 'O hash de transação deve começar com 0x e ter 66 caracteres\n\nHash atual: {{count}} caracteres',
    confirmNetwork: '⚠️ Confirmar Rede',
    areYouSureTransactionOnNetwork: 'Tem certeza de que a transação foi feita em {{network}} ({{label}})?\n\nA validação será feita APENAS nesta rede.',
    yesVerify: 'Sim, verificar',
    requestManualVerificationTitle: '📋 Solicitar Verificação Manual',
    doYouWantToSendManualRequest: 'Deseja enviar uma solicitação de verificação manual ao administrador?\n\nRede: {{network}} ({{label}})\nHash: {{hash}}\n\nUm administrador revisará sua transação e a aprovará manualmente. Este processo pode levar até 2 horas.',
    sendRequest: 'Enviar Solicitação',
    
    // Manual Verification
    manualVerification: 'Verificação Manual',
    verificationOfNowPaymentsPayments: 'Verificação de Pagamentos NowPayments',
    viewHistoryAndRequestManualVerification: 'Aqui você pode ver o histórico de seus pagamentos feitos através do NowPayments e solicitar verificação manual se um pagamento não foi creditado automaticamente.',
    noNowPaymentsRegistered: 'Você não tem pagamentos NowPayments registrados.',
    order: 'Ordem',
    paymentID: 'Payment ID',
    date: 'Data',
    manualVerificationRequested: '⏳ Verificação manual solicitada. Um administrador revisará seu pagamento em breve.',
    administratorReviewingPayment: '👀 Um administrador está revisando seu pagamento agora.',
    administratorRequestsMoreInfo: '📋 O administrador solicita mais informações',
    informationRequested: 'Informação solicitada:',
    responseSent: '✅ Resposta enviada. O administrador a revisará em breve.',
    respond: 'Responder',
    manualVerificationApproved: '✅ Verificação manual aprovada',
    rejectedReason: '❌ Rejeitado: {{reason}}',
    noReason: 'Sem motivo',
    paymentCreditedSuccessfully: '✅ Pagamento creditado com sucesso',
    verificationOfUSDTPayments: 'Verificação de Pagamentos USDT',
    requestManualVerificationOfUSDT: 'Solicite verificação manual de seus pagamentos USDT diretos digitando o hash da transação. Um administrador revisará seu pagamento e o creditará manualmente.',
    usdtPaymentHistory: 'Histórico de Pagamentos USDT',
    noUSDTPaymentsRegistered: 'Você não tem pagamentos USDT registrados.',
    network: 'Rede',
    transactionHash: 'Hash de Transação',
    requestManualUSDTVerification: 'Solicitar Verificação Manual USDT',
    doYouWantToRequestManualVerification: 'Deseja enviar uma solicitação de verificação manual ao administrador?\n\nRede: {{network}} ({{label}})\nHash: {{hash}}\n\nUm administrador revisará sua transação e a aprovará manualmente. Este processo pode levar até 2 horas.',
    requestSentSuccessfully: 'Solicitação Enviada com Sucesso',
    manualVerificationRequestSent: 'Sua solicitação de verificação manual foi enviada com sucesso.\n\nOrdem: {{order}}\nRede: {{network}}\nHash: {{hash}}\n\nUm administrador revisará sua transação nas próximas 2 horas.\n\nVocê pode ver o status de sua solicitação na seção de histórico.',
    hashDuplicate: 'Hash Duplicado',
    hashAlreadyRegistered: 'Este hash de transação já foi registrado anteriormente.\n\nOrdem: {{order}}\nStatus: {{status}}\n\nVocê não pode usar o mesmo hash de transação duas vezes.',
    errorSendingRequest: 'Erro ao Enviar Solicitação',
    couldNotSendVerificationRequest: 'Não foi possível enviar a solicitação de verificação.\n\nDetalhes: {{error}}\nCódigo: {{code}}\n\nPor favor tente novamente ou entre em contato com o suporte.',
    respondToAdministrator: 'Responder ao Administrador',
    yourResponse: 'Sua resposta:',
    writeYourResponseHere: 'Escreva sua resposta aqui...',
    send: 'Enviar',
    responseSentToAdministrator: 'Sua resposta foi enviada ao administrador. Você receberá uma notificação quando sua solicitação for revisada.',
    errorSendingResponse: 'Erro ao enviar resposta',
    nowPayments: 'NowPayments',
    directUSDT: 'USDT Direto',
    verificationOfNowPayments: 'Verificação de Pagamentos NowPayments',
    verificationOfUSDT: 'Verificação de Pagamentos USDT',
    requestManualVerificationNowPayments: '📋 Solicitar Verificação Manual',
    doYouWantToRequestNowPaymentsVerification: 'Deseja solicitar a verificação manual deste pagamento NowPayments?\n\nValor: {{amount}} USDT\nMXI: {{mxi}} MXI\nOrdem: {{order}}\n\nUm administrador revisará seu pagamento e o aprovará manualmente. Este processo pode levar até 2 horas.',
    request: 'Solicitar',
    requestSentMessage: 'Sua solicitação de verificação manual foi enviada com sucesso.\n\nUm administrador revisará seu pagamento nas próximas 2 horas.\n\nVocê receberá uma notificação quando seu pagamento for verificado.',
    existingRequest: 'Solicitação Existente',
    existingRequestMessage: 'Já existe uma solicitação de verificação para este pagamento.\n\nStatus: {{status}}\n\nPor favor, aguarde o administrador revisá-la.',
    
    // Transaction History Page
    transactionHistoryTitle: 'Histórico de Transações',
    loadingHistory: 'Carregando histórico...',
    successful: 'Bem-sucedidas',
    failed: 'Falhadas',
    noTransactions: 'Sem transações',
    noTransactionsYet: 'Você ainda não fez nenhuma transação',
    noPendingTransactions: 'Sem transações pendentes',
    noSuccessfulTransactions: 'Sem transações bem-sucedidas',
    noFailedTransactions: 'Sem transações falhadas',
    purchaseMXINowPayments: 'Compra MXI (NOWPayments)',
    purchaseMXIOKX: 'Compra MXI (OKX)',
    manualPayment: 'Pagamento Manual',
    commission: 'Comissão',
    completed: 'Completado',
    confirmed: 'Confirmado',
    waitingForPayment: 'Aguardando Pagamento',
    confirming: 'Confirmando',
    expired: 'Expirado',
    cancelled: 'Cancelado',
    walletAddress: 'Endereço da Carteira',
    completedOn: 'Completado',
    noPaymentID: 'Sem ID de Pagamento',
    paymentCreationFailed: 'Esta transação não tem um ID de pagamento válido. É provável que a criação do pagamento tenha falhado.',
    cancelTransaction: 'Cancelar Transação',
    areYouSureCancelTransaction: 'Tem certeza de que deseja cancelar esta transação pendente?',
    noCancelIt: 'Não',
    yesCancelIt: 'Sim, Cancelar',
    transactionCancelled: 'A transação foi cancelada',
    couldNotCancelTransaction: 'Não foi possível cancelar a transação',
    errorVerifying: 'Erro ao Verificar',
    couldNotVerifyPaymentStatus: 'Não foi possível verificar o status do pagamento. Por favor tente novamente.',
    viewDetails: 'Ver Detalhes',
    errorDetails: 'Detalhes do Erro',
    noDetailsAvailable: 'Sem detalhes disponíveis',
    paymentConfirmed: 'Pagamento Confirmado',
    paymentConfirmedBalanceUpdated: 'Seu pagamento foi confirmado. Seu saldo foi atualizado.',
    paymentFailed: 'Pagamento Falhou',
    paymentFailedOrExpired: 'O pagamento {{status}}. Você pode tentar criar uma nova ordem.',
    paymentStatus: 'Status do Pagamento',
    currentStatus: 'Status atual: {{status}}\n\nO pagamento ainda está sendo processado.',
    couldNotVerifyStatus: 'Não foi possível verificar o status do pagamento',
    networkError: 'Erro de Rede',
    couldNotConnectToServer: 'Não foi possível conectar ao servidor. Por favor verifique sua conexão com a internet e tente novamente.',
    pay: 'Pagar',
    verify: 'Verificar',
    viewTechnicalDetails: 'Ver detalhes técnicos',
    allTransactions: 'Todas',
    pendingTransactions: 'Pendentes',
    successfulTransactions: 'Bem-sucedidas',
    failedTransactions: 'Falhadas',
    
    // Withdrawals History
    withdrawalHistoryTitle: 'Histórico de Retiradas',
    noWithdrawalsYet: 'Sem Retiradas Ainda',
    withdrawalHistoryWillAppear: 'Seu histórico de retiradas aparecerá aqui uma vez que você faça sua primeira retirada.',
    processing: 'Processando',
    
    // Vesting
    vestingBalance: 'Saldo de Vesting',
    mxiVestingBalance: 'Saldo MXI (Vesting)',
    loadingVestingData: 'Carregando dados de vesting...',
    
    // Edit Profile
    enterYourFullName: 'Digite seu nome completo',
    enterFullLegalName: 'Digite seu nome legal completo como aparece em sua identificação',
    enterYourIDNumber: 'Digite seu número de identificação',
    enterNationalID: 'Digite sua carteira de identidade nacional, passaporte ou número de carteira de motorista',
    residentialAddress: 'Endereço Residencial',
    enterYourResidentialAddress: 'Digite seu endereço residencial',
    enterCompleteAddress: 'Digite seu endereço residencial completo',
    emailAddressReadOnly: 'Endereço de E-mail (Somente leitura)',
    referralCodeReadOnly: 'Código de Referência (Somente leitura)',
    saveChanges: 'Salvar Alterações',
    profileLocked: 'Perfil Bloqueado',
    profileCannotBeEdited: 'Seu perfil não pode ser editado porque sua verificação KYC está {{status}}.',
    profileInfoCanOnlyBeModified: 'As informações do perfil só podem ser modificadas antes da aprovação da verificação KYC.',
    backToProfile: 'Voltar ao Perfil',
    importantNotice: 'Aviso Importante',
    canOnlyEditBeforeKYC: 'Você só pode editar as informações do seu perfil antes da aprovação da sua verificação KYC. Certifique-se de que todas as informações estejam precisas antes de enviar seu KYC.',
    emailAndReferralCannotChange: 'Seu endereço de e-mail e código de referência não podem ser alterados. Se você precisar atualizá-los, entre em contato com o suporte.',
    profileUpdatedSuccessfully: 'Seu perfil foi atualizado com sucesso',
    failedToUpdateProfile: 'Falha ao atualizar perfil. Por favor tente novamente.',
    pleaseEnterFullName: 'Por favor digite seu nome completo',
    pleaseEnterAddress: 'Por favor digite seu endereço',
    pleaseEnterIDNumber: 'Por favor digite seu número de identificação',
    idNumberAlreadyRegistered: 'Este número de identificação já está registrado em outra conta',
    
    // Terms
    viewTerms: 'Ver Termos e Condições',
    acceptTerms: 'Li e aceito os',
    
    // Messages
    emailVerificationRequired: 'Verificação de E-mail Necessária',
    pleaseVerifyEmail: 'Por favor verifique seu endereço de e-mail antes de fazer login. Verifique sua caixa de entrada para o link de verificação.',
    resendEmail: 'Reenviar E-mail',
    accountCreatedSuccess: 'Conta criada com sucesso! Por favor verifique seu e-mail para verificar sua conta.',
    loginSuccess: 'Login bem-sucedido',
    loginError: 'Erro de Login',
    invalidCredentials: 'E-mail ou senha incorretos. Por favor verifique suas credenciais e tente novamente.',
    errorLoggingIn: 'Erro ao fazer login. Por favor tente novamente.',
    
    // Errors
    fillAllFields: 'Por favor preencha todos os campos obrigatórios',
    invalidEmail: 'Por favor digite um endereço de e-mail válido',
    passwordTooShort: 'A senha deve ter pelo menos 6 caracteres',
    passwordsDontMatch: 'As senhas não coincidem',
    
    // Info
    minimumInvestment: 'Investimento mínimo a partir de 50 USDT',
    poolClosesOn: 'A Pré-Venda fecha em 15 de fevereiro de 2026 às 12:00 UTC',
    
    // Admin
    adminPanel: 'Painel de Administrador',
    manageUsers: 'Gerenciar usuários e sistema',
    
    // Stats
    memberSince: 'Membro desde',
    
    // Actions
    refresh: 'Atualizar',
    updating: 'Atualizando...',
    
    // Conversion
    equivalent: 'Equivalente',
    
    // Time
    processingTime24to48: 'Tempo de processamento: 24-48 horas',
    
    // Important
    important: 'Importante',
    note: 'Nota',
    warning: 'Aviso',
    
    // Calculator
    calculator: 'Calculadora',
    
    // Profile Page - Additional
    updateYourInfo: 'Atualize suas informações',
    areYouSureLogout: 'Tem certeza de que deseja sair?',
    
    // Support Page - Additional
    supportAndHelp: 'Suporte e Ajuda',
    getAssistance: 'Obtenha assistência de nossa equipe',
    newSupportRequestButton: 'Nova Solicitação de Suporte',
    categoryLabel: 'Categoria',
    generalCategory: 'Geral',
    kycCategory: 'KYC',
    withdrawalCategory: 'Retirada',
    transactionCategory: 'Transação',
    technicalCategory: 'Técnico',
    otherCategory: 'Outro',
    subjectLabel: 'Assunto',
    briefDescription: 'Breve descrição do seu problema',
    messageLabel: 'Mensagem',
    describeIssueInDetail: 'Descreva seu problema em detalhes...',
    sendMessageButton: 'Enviar Mensagem',
    messageSentSuccess: 'Sua mensagem foi enviada. Nossa equipe de suporte responderá em breve.',
    failedToSendMessageError: 'Falha ao enviar mensagem',
    noMessagesYetTitle: 'Ainda não há mensagens',
    createSupportRequestMessage: 'Crie uma solicitação de suporte para obter ajuda de nossa equipe',
    messageDetailComingSoon: 'Visualização de detalhes da mensagem em breve',
    repliesCount: 'respostas',
    pleaseEnterSubjectAndMessage: 'Por favor preencha todos os campos',
    
    // Contrataciones Page
    buyMXI: 'Comprar MXI',
    diagnosticSystem: 'Diagnóstico do Sistema',
    testServerConfiguration: 'Testar Configuração do Servidor',
    testingConfiguration: 'Testando configuração...',
    configurationCorrect: 'Configuração Correta',
    environmentVariablesConfigured: 'As variáveis de ambiente estão configuradas corretamente. O sistema de pagamentos deve funcionar.',
    serverConfigurationError: 'Erro de Configuração do Servidor',
    paymentSystemNotConfigured: 'O sistema de pagamentos não está configurado corretamente. Este é um problema do servidor que deve ser resolvido pelo administrador.',
    problemDetected: 'Problema Detectado:',
    nowPaymentsCredentialsNotConfigured: 'As credenciais do NOWPayments não estão configuradas no servidor',
    solutionForAdministrator: 'Solução (Para o Administrador):',
    goToSupabaseDashboard: '1. Ir ao Dashboard do Supabase',
    navigateToProjectSettings: '2. Navegar para Project Settings → Edge Functions',
    addEnvironmentVariables: '3. Adicionar as seguintes variáveis de ambiente:',
    redeployEdgeFunctions: '4. Reimplantar as Edge Functions',
    contactAdministrator: 'Por favor, entre em contato com o administrador do sistema para resolver este problema.',
    importantPaymentInfo: 'Importante',
    paymentsProcessedInUSDT: 'Os pagamentos são processados com USDT na rede Ethereum (ERC20)',
    useCorrectNetwork: 'Certifique-se de usar a rede correta ao pagar',
    paymentExpiresIn1Hour: 'O pagamento expira em 1 hora',
    tokensAutomaticallyCredited: 'Os tokens são creditados automaticamente ao confirmar',
    currentPresalePhaseTitle: 'Fase Atual de Pré-Venda',
    activePhaseLabel: 'Fase Ativa',
    currentPriceLabel: 'Preço Atual',
    tokensSoldLabel: 'Tokens Vendidos',
    untilNextPhaseLabel: 'Até Próxima Fase',
    makePayment: 'Realizar Pagamento',
    amountInUSDT: 'Valor em USDT (mín: 3, máx: 500,000)',
    enterAmount: 'Digite o valor',
    youWillReceive: 'Você receberá:',
    payWithUSDTETH: 'Pagar com USDT (ETH)',
    recentPayments: 'Pagamentos Recentes',
    amount: 'Valor',
    price: 'Preço',
    status: 'Status',
    poolBenefits: 'Benefícios do Pool',
    receiveMXITokens: 'Receba tokens MXI por sua participação',
    generateYield: 'Gere rendimentos de 0.005% por hora',
    earnCommissions: 'Ganhe comissões por referências (5%, 2%, 1%)',
    participateInLiquidityPool: 'Participe do pool de liquidez',
    earlyAccessToLaunch: 'Acesso antecipado ao lançamento oficial',
    preferentialPresalePrice: 'Preço preferencial na pré-venda (aumenta por fase)',
    errorModalTitle: 'Erro de Pagamento',
    errorMessage: 'Mensagem de Erro:',
    errorCode: 'Código de Erro:',
    requestID: 'Request ID:',
    httpStatusCode: 'Código de Status HTTP:',
    timestamp: 'Timestamp:',
    copyDetailsToConsole: 'Copiar Detalhes para Console',
    detailsCopied: 'Detalhes Copiados',
    errorDetailsCopiedToConsole: 'Os detalhes do erro foram copiados para o log do console',
    minimumAmountIs3USDT: 'O valor mínimo é 3 USDT',
    maximumAmountIs500000USDT: 'O valor máximo é 500,000 USDT',
    paymentCreated: 'Pagamento Criado',
    paymentPageOpened: 'A página de pagamento foi aberta. Complete o pagamento e retorne ao app para ver o status.',
    paymentCompleted: 'Pagamento Completado!',
    youHaveReceived: 'Você recebeu {{amount}} tokens MXI',
    paymentFailedTitle: 'Pagamento Falhou',
    paymentCouldNotBeCompleted: 'O pagamento não pôde ser completado. Por favor, tente novamente.',
    paymentExpired: 'Pagamento Expirado',
    paymentTimeExpired: 'O tempo para completar o pagamento expirou. Por favor, crie um novo pagamento.',
    ifExperiencingProblems: 'Se você tiver problemas com pagamentos, use este botão para verificar se as variáveis de ambiente estão configuradas corretamente.',
    
    // Additional hardcoded text found in files
    copied2: 'Copiado',
    addressCopiedToClipboard: 'Endereço copiado para a área de transferência',
    pleaseEnterTransactionHash: 'Por favor digite o hash da transação',
    invalidHash: 'Hash Inválido',
    confirmNetworkTitle: 'Confirmar Rede',
    areYouSureTransaction: 'Tem certeza de que a transação foi feita em {{network}} ({{label}})?\n\nA validação será feita APENAS nesta rede.',
    yesVerifyButton: 'Sim, verificar',
    requestManualVerificationButton: 'Solicitar Verificação Manual',
    sendingRequestText: 'Enviando solicitação...',
    hashDuplicateTitle: 'Hash Duplicado',
    hashAlreadyRegisteredText: 'Este hash de transação já foi registrado anteriormente.\n\nOrdem: {{order}}\nStatus: {{status}}\n\nVocê não pode usar o mesmo hash de transação duas vezes.',
    requestSentSuccessfullyTitle: 'Solicitação Enviada com Sucesso',
    manualVerificationRequestSentText: 'Sua solicitação de verificação manual foi enviada com sucesso.\n\nOrdem: {{order}}\nRede: {{network}}\nHash: {{hash}}\n\nUm administrador revisará sua transação nas próximas 2 horas.\n\nVocê pode ver o status de sua solicitação na seção de histórico.',
    errorSendingRequestTitle: 'Erro ao Enviar Solicitação',
    couldNotSendVerificationRequestText: 'Não foi possível enviar a solicitação de verificação.\n\nDetalhes: {{error}}\nCódigo: {{code}}\n\nPor favor tente novamente ou entre em contato com o suporte.',
    paymentConfirmedTitle: 'Pagamento Confirmado',
    paymentConfirmedText: '{{amount}} MXI foram creditados à sua conta.\n\nRede: {{network}}\nUSDT pagos: {{usdt}}',
    viewBalance: 'Ver Saldo',
    verificationError: 'Erro de Verificação',
    transactionNotFound: 'Transação Não Encontrada',
    transactionNotFoundText: 'A transação não foi encontrada em {{network}}.\n\n📋 Passos para solucionar:\n\n1. Verifique se o hash está correto\n2. Certifique-se de que a transação está na rede {{network}}\n3. Aguarde a transação ter pelo menos 1 confirmação\n4. Verifique em um explorador de blocos:\n   • Ethereum: etherscan.io\n   • BNB Chain: bscscan.com\n   • Polygon: polygonscan.com',
    waitingConfirmations: 'Aguardando Confirmações',
    waitingConfirmationsText: 'A transação precisa de mais confirmações.\n\n{{message}}\n\nConfirmações atuais: {{confirmations}}\nConfirmações necessárias: {{required}}\n\n⏰ Por favor aguarde alguns minutos e tente novamente.',
    insufficientAmountTitle: 'Valor Insuficiente',
    insufficientAmountText: 'O valor mínimo é {{min}} USDT.\n\n{{message}}\n\nValor recebido: {{usdt}} USDT\nValor mínimo: {{minimum}} USDT',
    alreadyProcessed: 'Já Processado',
    alreadyProcessedText: 'Esta transação já foi processada anteriormente.\n\nSe você acredita que isso é um erro, entre em contato com o suporte.',
    invalidTransfer: 'Transferência Não Válida',
    invalidTransferText: 'Nenhuma transferência USDT válida foi encontrada para o endereço receptor.\n\n📋 Verifique:\n\n1. Que você enviou USDT (não outro token)\n2. Que o endereço receptor está correto:\n   {{address}}\n3. Que a transação está em {{network}}',
    transactionFailed: 'Transação Falhou',
    transactionFailedText: 'A transação falhou na blockchain.\n\nVerifique o status da transação em um explorador de blocos.',
    invalidNetworkTitle: 'Rede Não Válida',
    invalidNetworkText: 'Rede não válida selecionada.\n\nSelecione uma das redes disponíveis: Ethereum, BNB Chain ou Polygon.',
    configurationError: 'Erro de Configuração',
    configurationErrorText: 'Erro de configuração do servidor.\n\n{{message}}\n\n⚠️ Entre em contato com o administrador do sistema.',
    incorrectNetwork: 'Rede Incorreta',
    incorrectNetworkText: 'O RPC está conectado à rede incorreta.\n\nEntre em contato com o administrador do sistema.',
    authenticationError: 'Erro de Autenticação',
    authenticationErrorText: 'Sua sessão expirou.\n\nPor favor saia e faça login novamente.',
    incompleteData: 'Dados Incompletos',
    incompleteDataText: 'Dados necessários estão faltando.\n\nCertifique-se de digitar o hash da transação.',
    databaseError: 'Erro de Banco de Dados',
    databaseErrorText: 'Erro ao processar a transação.\n\n{{message}}\n\nPor favor tente novamente ou entre em contato com o suporte.',
    rpcConnectionError: 'Erro de Conexão RPC',
    rpcConnectionErrorText: 'Não foi possível conectar ao nó da blockchain.\n\n{{message}}\n\nPor favor tente novamente em alguns minutos.',
    internalError: 'Erro Interno',
    internalErrorText: 'Erro interno do servidor.\n\n{{message}}\n\nPor favor tente novamente ou entre em contato com o suporte.',
    unknownError: 'Erro Desconhecido',
    unknownErrorText: 'Erro ao verificar o pagamento.\n\nPor favor tente novamente ou entre em contato com o suporte.',
    connectionError: 'Erro de Conexão',
    connectionErrorText: 'Não foi possível conectar ao servidor.\n\nDetalhes técnicos:\n{{message}}\n\n📋 Passos para solucionar:\n\n1. Verifique sua conexão com a internet\n2. Tente novamente em alguns segundos\n3. Se o problema persistir, entre em contato com o suporte',
    pasteHashHereText: 'Cole o hash aqui',
    loadingUserData: 'Carregando dados do usuário...',
    loadingKYCData: 'Carregando dados KYC...',
    successUploadDocument: 'Sucesso',
    frontDocumentUploaded: 'Documento frontal enviado com sucesso!',
    backDocumentUploaded: 'Documento traseiro enviado com sucesso!',
    uploadError: 'Erro de Envio',
    errorUploadingDocument: 'Erro ao enviar documento. Por favor tente novamente.',
    pleaseEnterFullNameText: 'Por favor digite seu nome completo',
    pleaseEnterDocumentNumber: 'Por favor digite seu número de documento',
    pleaseUploadFrontDocument: 'Por favor envie a frente do seu documento de identidade',
    pleaseUploadBackDocument: 'Por favor envie o verso do seu documento de identidade',
    idCard: 'Carteira de Identidade',
    passportDoc: 'Passaporte',
    driversLicenseDoc: 'Carteira de Motorista',
    withdrawalHistoryTitle2: 'Histórico de Retiradas',
    processing2: 'Processando',
    loadingVestingDataText: 'Carregando dados de vesting...',
    errorLoadingVestingData: 'Erro ao carregar dados de vesting',
    couldNotLoadVestingInfo: 'Não foi possível carregar as informações de vesting',
    vestingSourceTitle: 'Fonte de Vesting',
    vestingSourceDescriptionText: 'O vesting é gerado APENAS do MXI comprado diretamente com USDT. As comissões NÃO geram vesting. Este gráfico representa o crescimento pessoal do usuário em MXI: compras, despesas, perdas, etc.',
    mxiPurchasedVestingBaseText: 'MXI Comprado (Base de Vesting)',
    mxiInVestingText: 'MXI em Vesting',
    availableForWithdrawalText: 'Disponível para retirada uma vez que a moeda seja lançada',
    blockedUntilLaunchText: 'Bloqueado até o lançamento oficial',
    daysRemainingText: 'dias',
    balanceBlockedTitle: 'Saldo Bloqueado',
    balanceBlockedDescriptionText: 'O saldo de vesting não pode ser unificado ou retirado até que a moeda seja oficialmente lançada. Uma vez lançada, você poderá retirar seu saldo cumprindo os requisitos de retirada (5 referências ativas e KYC aprovado).',
    timeUntilLaunchText: 'Tempo até o lançamento:',
    releasedText: 'Liberado',
    releasePercentageText: 'Porcentagem de liberação:',
    releasesCompletedText: 'Liberações realizadas:',
    nextReleaseText: 'Próxima liberação:',
    withdrawalStatusText: 'Status de retirada:',
    enabledText: 'Habilitado',
    blockedUntilLaunchShortText: 'Bloqueado até lançamento',
    whatIsVestingText: 'O que é Vesting?',
    vestingDescriptionText: 'O vesting é um mecanismo que libera gradualmente seus tokens MXI obtidos através de yield/rendimento do MXI comprado. Isso garante estabilidade no mercado e protege o valor da moeda.',
    vestingReleaseInfoText: 'A cada 10 dias, {{percentage}}% do seu saldo em vesting é liberado, que você pode retirar uma vez que atenda aos requisitos (5 referências ativas e KYC aprovado).',
    vestingReleaseInfoPreLaunchText: 'Uma vez que a moeda seja lançada, a cada 10 dias {{percentage}}% do seu saldo em vesting será liberado para retirada.',
    vestingImportantNoteText: '⚠️ Importante: Apenas o MXI comprado diretamente gera rendimento de vesting. As comissões NÃO geram vesting. O gráfico "Saldo MXI" mostra seu crescimento pessoal em MXI, não o vesting em si.',
    withdrawMXIText: 'Retirar MXI',
    withdrawVestingBalanceText: 'Retire seu saldo de vesting liberado',
    vestingInformationText: 'Informação de Vesting',
    everyTenDaysText: 'a cada 10 dias',
    bonusParticipation: 'Bônus de Participação',
    loadingBonusText: 'Carregando bônus...',
    noActiveBonusRoundText: 'Nenhuma rodada de bônus ativa',
    retryButton: 'Tentar Novamente',
    roundText: 'Rodada',
    openText: 'Aberto',
    lockedText: 'Bloqueado',
    prizePoolText: 'Poço de Prêmios (90%)',
    totalPoolText: 'Poço Total',
    ticketsSoldText: 'Bilhetes Vendidos',
    ticketPriceText: 'Preço do Bilhete',
    yourTicketsText: 'Seus Bilhetes',
    availableMXIText: 'MXI Disponível',
    purchaseTicketsText: 'Comprar Bilhetes',
    buyBetween1And20TicketsText: 'Compre entre 1 e 20 bilhetes. Máximo 20 bilhetes por usuário por rodada.',
    buyTicketsText: 'Comprar Bilhetes',
    numberOfTicketsText: 'Número de Bilhetes (1-20)',
    enterQuantityText: 'Digite a quantidade',
    ticketsText: 'Bilhetes',
    pricePerTicketText: 'Preço por bilhete',
    totalCostText: 'Custo Total',
    selectPaymentSourceText: 'Selecionar Fonte de Pagamento',
    chooseWhichMXIBalanceText: 'Escolha qual saldo de MXI usar para esta compra',
    mxiPurchasedSourceText: 'MXI Comprados',
    mxiFromCommissionsSourceText: 'MXI de Comissões',
    mxiFromChallengesSourceText: 'MXI de Desafios',
    howItWorksBonusText: 'Como Funciona',
    eachTicketCosts2MXIText: 'Cada bilhete custa 2 MXI',
    buyBetween1And20TicketsPerRoundText: 'Compre entre 1 e 20 bilhetes por rodada',
    roundLocksWhen1000TicketsSoldText: 'A rodada bloqueia quando 1000 bilhetes são vendidos',
    winnerReceives90PercentText: 'O vencedor recebe 90% do poço total',
    winnerAnnouncedOnSocialMediaText: 'O vencedor é anunciado nas redes sociais',
    purchaseIsFinalNoRefundsText: 'A compra é final - sem reembolsos',
    insufficientBalanceNeedForTicketsText: 'Você precisa de {{needed}} MXI para comprar {{quantity}} bilhete(s).\n\nSeu saldo disponível para desafios é {{available}} MXI.\n\nO MXI disponível inclui:\n- MXI comprados diretamente\n- MXI de comissões unificadas\n- MXI de ganhos de desafios',
    insufficientBalanceInSourceText: 'Seu saldo de {{source}} ({{available}} MXI) não é suficiente para cobrir o custo ({{needed}} MXI).',
    successfullyPurchasedTicketsText: 'Comprou com sucesso {{count}} bilhete(s) por {{cost}} MXI usando {{source}}!',
    failedToPurchaseTicketsText: 'Falha ao comprar bilhetes',
    pleaseEnterValidQuantity: 'Por favor digite uma quantidade válida entre 1 e 20',
    continueButton: 'Continuar',
    cancelButton: 'Cancelar',
    successTitle: 'Sucesso!',
    errorTitle: 'Erro',
    withdrawalHistoryTitle2: 'Histórico de Retiradas',
    noWithdrawalsYetText: 'Sem Retiradas Ainda',
    withdrawalHistoryWillAppearText: 'Seu histórico de retiradas aparecerá aqui uma vez que você faça sua primeira retirada.',
    walletAddressText: 'Endereço da Carteira:',
    completedText: 'Completado:',
    supportAndHelpText: 'Suporte e Ajuda',
    getAssistanceText: 'Obtenha assistência de nossa equipe',
    newSupportRequestButtonText: 'Nova Solicitação de Suporte',
    categoryLabelText: 'Categoria',
    generalCategoryText: 'Geral',
    kycCategoryText: 'KYC',
    withdrawalCategoryText: 'Retirada',
    transactionCategoryText: 'Transação',
    technicalCategoryText: 'Técnico',
    otherCategoryText: 'Outro',
    subjectLabelText: 'Assunto',
    briefDescriptionText: 'Breve descrição do seu problema',
    messageLabelText: 'Mensagem',
    describeIssueInDetailText: 'Descreva seu problema em detalhes...',
    sendMessageButtonText: 'Enviar Mensagem',
    messageSentSuccessText: 'Sua mensagem foi enviada. Nossa equipe de suporte responderá em breve.',
    failedToSendMessageErrorText: 'Falha ao enviar mensagem',
    noMessagesYetTitleText: 'Ainda não há mensagens',
    createSupportRequestMessageText: 'Crie uma solicitação de suporte para obter ajuda de nossa equipe',
    messageDetailComingSoonText: 'Visualização de detalhes da mensagem em breve',
    repliesCountText: 'respostas',
    pleaseEnterSubjectAndMessageText: 'Por favor preencha todos os campos',
    challengeHistoryText: 'Histórico de Desafios',
    viewGameRecordsText: 'Ver registros de jogos',
    allText: 'Todos',
    winsText: 'Vitórias',
    lossesText: 'Derrotas',
    noHistoryYetText: 'Sem Histórico Ainda',
    challengeHistoryWillAppearText: 'Seu histórico de desafios aparecerá aqui uma vez que você participe de jogos',
    scoreText: 'Pontuação',
    rankText: 'Classificação',
    wonText: 'Ganho',
    lostText: 'Perdido',
    expiresInText: 'Expira em',
    tournamentWinningsText: 'Ganhos de Torneios',
    totalWonText: 'Total Ganho',
    withdrawToMXIBalanceText: 'Retirar para Saldo MXI',
    transferWinningsToMainBalanceText: 'Transfira seus ganhos para seu saldo principal de MXI para usá-los em compras e outras funções.',
    amountToWithdrawMXIText: 'Valor a Retirar (MXI)',
    minimum50MXIRequiredText: 'Mínimo 50 MXI',
    invalidAmountEnterValidText: 'Valor Inválido. Por favor digite um valor válido',
    minimumWithdrawalIs50Text: 'A retirada mínima é de 50 MXI',
    insufficientBalanceOnlyHaveText: 'Você só tem {{available}} MXI disponíveis de ganhos de torneios',
    requirementsNotMetNeed5ReferralsText: 'Você precisa de 5 referências ativas que tenham comprado o mínimo de MXI.\n\nAtualmente você tem: {{count}} referências ativas',
    confirmWithdrawalToMXIBalanceText: 'Confirmar Retirada para Saldo MXI',
    doYouWantToTransferFromWinningsText: 'Deseja transferir {{amount}} MXI de ganhos de torneios para seu saldo principal?\n\nIsso permitirá que você use esses MXI para compras e outras funções.',
    withdrawalSuccessfulTransferredText: '{{amount}} MXI foram transferidos para seu saldo principal',
    confirmText: 'Confirmar',
    requirementsTitleText: 'Requisitos:',
    activeReferralsText: 'referências ativas',
    minimumText: 'Mínimo',
    availableText2: 'Disponível',
    editProfileText: 'Editar Perfil',
    personalInformationText: 'Informação Pessoal',
    fullNameText: 'Nome Completo',
    enterYourFullNameText: 'Digite seu nome completo',
    enterFullLegalNameText: 'Digite seu nome legal completo como aparece em sua identificação',
    idNumberText: 'Número de Identificação',
    enterYourIDNumberText: 'Digite seu número de identificação',
    enterNationalIDText: 'Digite sua carteira de identidade nacional, passaporte ou número de carteira de motorista',
    residentialAddressText: 'Endereço Residencial',
    enterYourResidentialAddressText: 'Digite seu endereço residencial',
    enterCompleteAddressText: 'Digite seu endereço residencial completo',
    emailAddressReadOnlyText: 'Endereço de E-mail (Somente leitura)',
    referralCodeReadOnlyText: 'Código de Referência (Somente leitura)',
    saveChangesText: 'Salvar Alterações',
    profileLockedText: 'Perfil Bloqueado',
    profileCannotBeEditedText: 'Seu perfil não pode ser editado porque sua verificação KYC está {{status}}.',
    profileInfoCanOnlyBeModifiedText: 'As informações do perfil só podem ser modificadas antes da aprovação da verificação KYC.',
    backToProfileText: 'Voltar ao Perfil',
    importantNoticeText: 'Aviso Importante',
    canOnlyEditBeforeKYCText: 'Você só pode editar as informações do seu perfil antes da aprovação da sua verificação KYC. Certifique-se de que todas as informações estejam precisas antes de enviar seu KYC.',
    emailAndReferralCannotChangeText: 'Seu endereço de e-mail e código de referência não podem ser alterados. Se você precisar atualizá-los, entre em contato com o suporte.',
    profileUpdatedSuccessfullyText: 'Seu perfil foi atualizado com sucesso',
    failedToUpdateProfileText: 'Falha ao atualizar perfil. Por favor tente novamente.',
    pleaseEnterFullNameText2: 'Por favor digite seu nome completo',
    pleaseEnterAddressText: 'Por favor digite seu endereço',
    pleaseEnterIDNumberText: 'Por favor digite seu número de identificação',
    idNumberAlreadyRegisteredText: 'Este número de identificação já está registrado em outra conta',
    successText2: 'Sucesso',
    errorText2: 'Erro',
  },
};

// Create i18n instance
const i18n = new I18n(translations);

// Set default locale
i18n.defaultLocale = 'es';
i18n.enableFallback = true;

// Storage key for language preference
const LANGUAGE_KEY = '@mxi_language';

// Initialize language from storage or device locale
export const initializeLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    
    if (savedLanguage) {
      i18n.locale = savedLanguage;
    } else {
      // Get device locale
      const deviceLocale = Localization.getLocales()[0]?.languageCode || 'es';
      
      // Map device locale to supported languages
      if (deviceLocale.startsWith('en')) {
        i18n.locale = 'en';
      } else if (deviceLocale.startsWith('pt')) {
        i18n.locale = 'pt';
      } else {
        i18n.locale = 'es'; // Default to Spanish
      }
    }
  } catch (error) {
    console.error('Error initializing language:', error);
    i18n.locale = 'es';
  }
};

// Save language preference
export const setLanguage = async (language: 'en' | 'es' | 'pt') => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    i18n.locale = language;
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

// Get current language
export const getCurrentLanguage = (): 'en' | 'es' | 'pt' => {
  return i18n.locale as 'en' | 'es' | 'pt';
};

export { i18n };
