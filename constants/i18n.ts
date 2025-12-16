
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
    copied2: '✅ Copied',
    or: 'or',
    and: 'and',
    total: 'Total',
    continue: 'Continue',
    send: 'Send',
    request: 'Request',
    sendRequest: 'Send Request',
    respond: 'Respond',
    pending: 'Pending',
    selectLanguage: 'Select Language',
    date: 'Date',
    currency: 'Currency',
    network: 'Network',
    order: 'Order',
    paymentID: 'Payment ID',
    transactionHash: 'Transaction Hash',
    
    // Tab Navigation
    tabHome: 'Home',
    tabDeposit: 'Deposit',
    tabWithdraw: 'Withdraw',
    tabReferrals: 'Referrals',
    tabTournaments: 'Tournaments',
    tabRewards: 'Rewards',
    tabEcosystem: 'Ecosystem',
    tabProfile: 'Profile',
    
    // Auth - Login Screen
    login: 'Login',
    loginButton: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    emailLabel: 'Email',
    password: 'Password',
    passwordLabel: 'Password',
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
    fillAllFields: 'Please fill in all fields',
    emailVerificationRequired: 'Email Verification Required',
    pleaseVerifyEmail: 'Please verify your email before logging in. Check your inbox for the verification link.',
    resendEmail: 'Resend Email',
    loginError: 'Login Error',
    invalidCredentials: 'Invalid email or password. Please try again.',
    errorLoggingIn: 'Error logging in. Please try again.',
    emailVerificationSent: 'Verification email sent! Please check your inbox.',
    errorResendingEmail: 'Error resending verification email. Please try again.',
    recoverPasswordTitle: 'Recover Password',
    recoverPasswordMessage: 'To recover your password, please contact our support team.',
    contactSupport: 'Contact Support',
    support: 'Support',
    sendEmailTo: 'Send an email to:',
    supportEmail: 'support@maxcoin.com',
    mxiStrategicPresale: 'MXI Strategic Presale',
    secureYourPosition: 'Secure your position in the future',
    viewTerms: 'View Terms and Conditions',
    termsAndConditions: 'Terms and Conditions',
    presaleClosesOn: 'Presale closes on February 15, 2026 at 12:00 UTC',
    pleaseVerifyEmailBeforeLogin: 'Please verify your email before logging in',
    resendEmailButton: 'Resend Email',
    
    // Register Screen
    joinMXIStrategicPresale: 'Join MXI Strategic Presale',
    fullName: 'Full Name',
    enterYourFullName: 'Enter your full name',
    enterYourIDNumber: 'Enter your ID number',
    enterYourResidentialAddress: 'Enter your residential address',
    minimumSixCharacters: 'Minimum 6 characters',
    reEnterPassword: 'Re-enter your password',
    enterReferralCode: 'Enter referral code (optional)',
    onlyOneAccountPerPerson: 'Only one account per person. Multiple accounts will be suspended.',
    iHaveReadAndAccept: 'I have read and accept the',
    alreadyHaveAccountLogin: 'Already have an account?',
    acceptTermsButton: 'Accept Terms',
    termsAndConditionsRequired: 'Terms and Conditions Required',
    youMustAcceptTerms: 'You must accept the Terms and Conditions to continue',
    passwordsDontMatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 6 characters',
    invalidEmail: 'Please enter a valid email address',
    accountCreatedSuccessfully: '✅ Account created successfully! Please verify your email before logging in.',
    failedToCreateAccount: 'Failed to create account. Please try again.',
    termsContent: `TERMS AND CONDITIONS OF USE

MXI STRATEGIC PRESALE – APP VERSION

MAXCOIN (MXI) is a registered trademark of MXI Strategic Holdings Ltd., Cayman Islands.
App operated by MXI Technologies Inc. (Panamá).
Last update: 15/01/2026 – Version 1.1

1. Acceptance

By creating an account or using the MXI Strategic Presale application (the "App"), you accept these Terms and Conditions.
If you do not agree with them, you should not use the App.

2. About MXI

MXI Strategic Holdings Ltd. (Cayman) is the entity that owns the MXI token, the brand and intellectual property.

MXI Technologies Inc. (Panama) is the company that operates the App and is responsible for its operation.

3. Function of the App

The App allows:

- Register users
- Buy MXI tokens with USDT (via CRYPTOCURRENCY)
- Access a referral system
- View balances, yields and movements
- Request withdrawals of commissions and/or MXI according to current rules

4. Eligibility

To use the App, you must:

- Be over 18 years old
- Have legal capacity to contract
- Provide truthful data
- Not live in countries where cryptocurrencies are prohibited

5. Registration and Account

- Only one account per person is allowed
- It is mandatory to complete KYC to enable withdrawals
- Registered information must match official documents
- Identification numbers cannot be repeated

6. Purchase of MXI Tokens

- Minimum purchase: 50 USDT
- Maximum per user: 100,000 USDT
- Payment exclusively in USDT through CRYPTOCURRENCY
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

Phased release if amount exceeds 50000 USDT:

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
- Use the App for illicit activities
- Process money laundering

13. Limitation of Liability

The App is offered "as is".
Neither MXI Strategic Holdings Ltd. nor MXI Technologies Inc. are responsible for:

- Economic losses
- Third party or blockchain errors
- Indirect or incidental damages
- Misuse of the App

14. Final Acceptance

By registering, you declare that:

- You have read and understand these Terms
- You accept the risks
- You provide truthful information
- You comply with the laws of your country

15. MXI TOKEN USE POLICY

The MXI token is a digital asset in pre-launch stage, without commercial value, without public listing and without recognition as legal tender in Colombia, Spain, Mexico or any other jurisdiction. Its use within the platform is exclusively functional, intended for internal rewards, participation in gamified activities and access to benefits of the MXI ecosystem.

MXI does not represent investments, property rights, guaranteed profitability, equity participation, financial instruments, negotiable securities or similar products. Users accept that the use of the token is experimental, subject to changes and dependent on technical and regulatory validation processes.

Any future value, convertibility or listing of the token will depend on conditions external to the company, regulatory processes and market decisions that cannot be guaranteed. The platform does not ensure economic benefits, appreciation or any return associated with MXI.

16. LEGAL ANNEX – MXI GAMES AND REWARDS

The dynamics available within the platform (including challenges, mini-games such as tap, clicker, "AirBall", skill challenges and the "Bonus MXI" modality) are based exclusively on the user's skill, speed, precision or active participation, and do not depend on chance to determine results.

No activity offered should be interpreted as:

- game of chance,
- bet,
- raffle for profit,
- regulated raffles,
- state or private lotteries,
- nor equivalent mechanisms regulated in Colombia, Spain or Mexico.

Access to these dynamics may require a symbolic payment in MXI, but such payment does not constitute a bet, since the token has no real economic value and is used only as an internal participation mechanism.

The "Bonus MXI" modality, including random prize allocation, is carried out outside the main platform, through independent, transparent and verifiable processes, whose purpose is to distribute promotional rewards in MXI without this constituting a regulated game of chance.

Users accept that the rewards granted are promotional, digital and without commercial value, and that participation in any dynamic does not guarantee real economic gains.

---

**IMPORTANT**: These terms and conditions are legally binding. If you do not agree with any part, you should not use the Application. It is recommended to consult with a legal or financial advisor before making investments in cryptocurrencies.

**Effective date**: January 15, 2026
**Version**: 1.1`,
    privacyPolicy: 'Privacy Policy',
    viewPrivacyPolicy: 'View Privacy Policy',
    privacyPolicyContent: `PRIVACY POLICY

This Privacy Policy describes how MXI Technologies Inc. ("MXI", "we") collects, uses and protects the personal data of users who use the MXI Strategic Presale App ("the App"). By registering or using the App, you accept this Policy.

1. Data we collect

We collect the information necessary for the safe operation of the App, including:

- Full name
- Identity document
- Date of birth
- Email
- Phone number
- Session and activity data in the App
- USDT wallet provided by the user
- Information captured during the KYC process (photo of document, selfie, biometric verification)

We do not collect data that is not necessary for the operation of the service.

2. Use of information

We use your data to:

- Create and manage your account
- Verify identity (KYC)
- Allow MXI purchases in the development stage
- Manage the referral system
- Process withdrawal requests
- Improve security and prevent fraud
- Send notifications related to your account or App changes

Your data is not sold or exchanged with third parties.

3. Legal bases

The treatment is based on:

- Your consent when registering
- Compliance with verification obligations (KYC/AML)
- Fraud prevention
- Execution of the contracted service

4. Storage and protection

MXI adopts technical and administrative measures to protect information, including:

- Encryption
- Restricted access
- Anti-fraud controls
- Secure servers

No system is completely invulnerable, but we apply good international security practices.

5. Data sharing

We may share data only with:

- KYC verification providers
- Analysis or security services
- Competent authorities if required by law

We do not share data with third parties for commercial purposes.

6. Data retention

We retain your data while your account is active and for the time required to:

- Comply with legal obligations
- Resolve disputes
- Prevent fraudulent activities

You can request deletion of your account, except when there are pending regulatory obligations.

7. User rights

You can:

- Access your data
- Rectify them
- Update them
- Request deletion
- Withdraw your consent
- Limit treatment

To exercise these rights, you can contact us via support within the App.

8. International transfers

Your data may be processed in countries with different protection laws than yours. By using the App, you authorize such transfers, always under adequate security measures.

9. Minors

The use of the App is restricted to persons over 18 years of age. We will delete any account created by minors.

10. Changes to this Policy

We may update this Policy at any time. The current version will be available within the App. Continued use implies acceptance of changes.

11. Contact

For inquiries or requests related to privacy you can contact us through the official support of the App.

Version 1.1 – Effective from 01/15/2026.`,
    
    // Admin Panel - User Management
    userManagement: 'User Management',
    searchPlaceholder: 'Search by name, email, ID...',
    loadingUsers: 'Loading users...',
    all: 'All',
    actives: 'Active',
    inactive: 'Inactive',
    blocked: 'Blocked',
    noUsersFound: 'No users found',
    adjustSearchFilters: 'Adjust your search or filters',
    refs: 'refs',
    joined: 'Joined',
    userDetails: 'User Details',
    blockUser: 'Block User',
    blockUserConfirm: 'Are you sure you want to block this user?',
    block: 'Block',
    blockedByAdmin: 'Blocked by administrator',
    userBlockedSuccess: 'User blocked successfully',
    errorBlockingUser: 'Error blocking user',
    unblockUser: 'Unblock User',
    unblockUserConfirm: 'Are you sure you want to unblock this user?',
    unblock: 'Unblock',
    userUnblockedSuccess: 'User unblocked successfully',
    errorUnblockingUser: 'Error unblocking user',
    failedToLoadSettings: 'Failed to load settings',
    
    // Home Screen
    hello: 'Hello',
    welcomeToMXI: 'Welcome to MXI',
    phasesAndProgress: 'Phases and Progress',
    currentPhase: 'Current Phase',
    usdtPerMXI: 'USDT per MXI',
    phase: 'Phase',
    sold: 'Sold',
    remaining: 'Remaining',
    generalProgress: 'Overall Progress',
    of: 'of',
    totalMXIDelivered: 'Total MXI Delivered',
    mxiDeliveredToAllUsers: 'MXI delivered to all users (all sources)',
    poolClose: 'Pool closes on',
    perMXIText: 'per MXI',
    
    // Launch Countdown
    officialLaunch: 'Official Launch',
    maxcoinMXI: 'MAXCOIN (MXI)',
    launchDate: 'February 15, 2026 at 12:00 UTC',
    presaleStart: 'Presale Start',
    presaleEnd: 'Presale End',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    poolActive: 'Pool Active',
    vestingRealTime: 'Vesting in Real-Time',
    
    // Total MXI Balance Chart
    totalMXIBalance: 'Total MXI Balance',
    allSourcesIncluded: 'All sources included',
    noBalanceHistory: 'No balance history available',
    chartShowsDynamicBalance: 'This chart shows your total MXI balance over time, including all sources: purchases, commissions, tournaments, and vesting.',
    loadingChart: 'Loading chart...',
    purchased: 'Purchased',
    commissions: 'Commissions',
    tournaments: 'Tournaments',
    vesting: 'Vesting',
    completeBreakdown: 'Complete Breakdown',
    mxiPurchased: 'MXI Purchased',
    mxiCommissions: 'MXI Commissions',
    mxiTournaments: 'MXI Tournaments',
    vestingRealTimeLabel: 'Vesting (Real-Time)',
    updatingEverySecond: 'Updating every second',
    mxiTotal: 'MXI Total',
    balanceChangeTimestamps: 'Balance Change Timestamps',
    
    // Yield Display
    vestingMXI: 'Vesting MXI',
    generatingPerSecond: 'Generating {{rate}} MXI per second',
    mxiPurchasedVestingBase: 'MXI Purchased (Vesting Base)',
    onlyPurchasedMXIGeneratesVesting: 'Only purchased MXI generates vesting',
    currentSession: 'Current Session',
    totalAccumulated: 'Total Accumulated',
    perSecond: 'Per Second',
    perMinute: 'Per Minute',
    perHour: 'Per Hour',
    dailyYield: 'Daily Yield',
    claimYield: 'Claim Yield',
    claiming: 'Claiming...',
    yieldInfo: 'Vesting is generated automatically from your purchased MXI. You can claim it once you meet the withdrawal requirements.',
    noYield: 'No Yield',
    needMoreYield: 'You need to accumulate more yield before claiming.',
    requirementsNotMet: 'Requirements Not Met',
    claimRequirements: 'You need 5 active referrals to claim yield. Current: {{count}}/5',
    kycRequired: 'KYC Required',
    kycRequiredMessage: 'You need to complete KYC verification before claiming yield.',
    yieldClaimed: 'Yield Claimed',
    yieldClaimedMessage: 'Successfully claimed {{amount}} MXI!',
    claimFailed: 'Claim Failed',
    requirementsToWithdraw: 'Requirements to Withdraw',
    activeReferralsForGeneralWithdrawals: '5 Active Referrals for general withdrawals ({{count}}/5)',
    kycApproved: 'KYC Approved',
    
    // Ecosystem Screen
    ecosystem: 'Ecosystem',
    liquidityPool: 'Liquidity Pool',
    whatIsMXI: 'What is MXI?',
    howItWorksTab: 'How It Works',
    whyBuy: 'Why Buy',
    meta: 'Goal',
    ecosystemTab: 'Ecosystem',
    quantumSecurity: 'Quantum Security',
    sustainability: 'Sustainability',
    dailyVesting: 'Daily Vesting',
    inPractice: 'In Practice',
    tokenomics: 'Tokenomics',
    risks: 'Risks',
    
    // Ecosystem Tab Content - NEW CONTENT
    ecosystemTabTitle: 'MXI Ecosystem',
    ecosystemIntro: '🌐 MXI is an ecosystem, not just a token: it is a complete infrastructure designed to operate as a self-sustaining digital economy, capable of integrating products, services, technology, and community within the same interconnected environment. Each element is designed to feed the others, generating flow, utility, and real growth for users, entrepreneurs, and investors alike.',
    ecosystemApproach: '🚀 Our approach turns MXI into a living, scalable, and functional environment, where all solutions connect to create continuous and decentralized value.',
    ecosystemComponentsTitle: 'MXI Ecosystem Components',
    ecosystemComponentsSubtitle: 'Below are the pillars that make MXI a true ecosystem:',
    ecosystemComponent1Title: '1. 💎 MXI Token (ecosystem core)',
    ecosystemComponent1Desc: 'The token is the foundation upon which the entire MXI economy is built: transactions, rewards, voting, payments, governance, and access to services.',
    ecosystemComponent2Title: '2. 🔐 Multi-Layer MXI Wallet',
    ecosystemComponent2Desc: 'Smart wallet with quantum security architecture, prepared for future threats and focused on protecting assets, identities, and transactions.',
    ecosystemComponent3Title: '3. 💰 MXI DeFi Platform',
    ecosystemComponent3Desc: 'Includes:',
    ecosystemComponent3Point1: '- Staking and automated rewards',
    ecosystemComponent3Point2: '- Liquidity pools',
    ecosystemComponent3Point3: '- Decentralized loans for entrepreneurs',
    ecosystemComponent3Point4: '- Sustainable yield mechanisms',
    ecosystemComponent4Title: '4. 🚀 MXI Launchpad for entrepreneurs',
    ecosystemComponent4Desc: 'Space for new projects to receive funding within the ecosystem using MXI, driving the real economy and innovation.',
    ecosystemComponent5Title: '5. 💳 MXI Pay & MXI Card',
    ecosystemComponent5Desc: 'An interoperable card that allows you to use MXI in merchants, daily payments, global purchases, and withdrawals. Designed to integrate digital finance and everyday life.',
    ecosystemComponent6Title: '6. 🛡️ Quantum Security System',
    ecosystemComponent6Desc: 'Our infrastructure adopts algorithms resistant to quantum computing, anticipating the technological challenges of the next decade.',
    ecosystemComponent7Title: '7. 🌍 Marketplace & Web3 Integrations',
    ecosystemComponent7Desc: 'Projects, services, products, and utilities that use MXI as a means of payment and exchange, strengthening the circulation of value.',
    ecosystemComponent8Title: '8. 🗳️ Community Governance Program',
    ecosystemComponent8Desc: 'The community votes, proposes, and decides the direction of the ecosystem. If MXI grows, everyone wins.',
    ecosystemComponent9Title: '9. 📚 MXI Academy (training & community)',
    ecosystemComponent9Desc: 'Financial education, blockchain, and project development to empower entrepreneurs and investors.',
    ecosystemSummaryTitle: 'Summary',
    ecosystemSummaryIntro: 'MXI is an ecosystem because it integrates:',
    ecosystemSummaryPoint1: 'Token',
    ecosystemSummaryPoint2: 'Wallet',
    ecosystemSummaryPoint3: 'Quantum security',
    ecosystemSummaryPoint4: 'DeFi Platform',
    ecosystemSummaryPoint5: 'Card and payments',
    ecosystemSummaryPoint6: 'Launchpad',
    ecosystemSummaryPoint7: 'Marketplace',
    ecosystemSummaryPoint8: 'Governance',
    ecosystemSummaryPoint9: 'Training',
    ecosystemSummaryPoint10: 'Community',
    ecosystemSummaryConclusion: '✨ All connected to create a real decentralized economy, where cooperation multiplies value.',
    
    // Sustainability Tab Content - NEW CONTENT
    sustainabilityIntro: '💎 MXI is sustainable in the long term because its economic model is based on real utility, organic growth, and community participation. Unlike speculative projects, MXI incorporates services that generate constant token movement: payments, marketplace, loans, staking, card, tools for entrepreneurs, and shared value programs. Each service feeds the ecosystem, avoiding dependence on new buyers to sustain the economy.',
    sustainabilityDecentralized: '🌍 Additionally, the decentralized approach allows the community to drive key decisions, creating an adaptable, self-sufficient system resistant to external crises. The adoption of advanced technologies such as quantum security, the modularity of its architecture, and the focus on real economy ensure that MXI evolves, expands, and remains relevant for the coming decades.',
    
    // Vesting Diario Tab Content - NEW CONTENT
    vestingDiarioIntro: 'Daily Vesting is a mechanism designed to protect the stability of the project during the presale and, at the same time, provide investors with a fair, predictable, and sustainable way to receive their tokens. Instead of releasing all tokens immediately—which usually generates drastic drops due to massive sales—MXI distributes allocations progressively, balanced, and transparently.',
    vestingDiarioHowItWorks: 'From the moment a user acquires MXI in presale, their total balance is recorded in a smart contract that manages daily release. Every 24 hours, a predefined percentage of the total purchased is released automatically, allowing the user to withdraw it, transfer it, or use it within the ecosystem. This process ensures that all participants have gradual access to their tokens without saturating the market, while the project advances in development, user growth, financial services integration, and ecosystem expansion.',
    vestingDiarioBenefits: 'The goal is to create a natural balance between supply and demand, which strengthens the token valuation and benefits early investors with a sustainable model.',
    vestingDiarioTransparency: 'Additionally, daily vesting is part of MXI\'s commitment to transparency: each release can be audited on the blockchain, and users maintain total control over their token flow without depending on intermediaries.',
    vestingDiarioSummaryTitle: 'In summary, daily vesting is a tool designed to:',
    vestingDiarioBenefit1: '🛡️ Protect the token value and avoid abrupt drops.',
    vestingDiarioBenefit2: '📈 Accompany the real growth of the ecosystem.',
    vestingDiarioBenefit3: '🤝 Create equality among investors in the initial stage.',
    vestingDiarioBenefit4: '🔍 Guarantee traceability and security in each release.',
    vestingDiarioBenefit5: '🔄 Offer progressive liquidity without compromising sustainability.',
    vestingDiarioConclusion: 'With this model, MXI builds a responsible and future-oriented scenario, where each member of the community receives their share in a balanced way, while the project develops the foundations of a real decentralized economy.',
    
    // Quantum Security Tab Content - UPDATED CONTENT
    quantumSecurityTitle: 'Quantum Security',
    quantumSecurityIntro: '🔐 MXI will integrate quantum security through certified post-quantum algorithms, encryption techniques resistant to quantum computing, and digital identity structures impossible to breach even against advanced attacks.',
    quantumSecurityTechnical: '⚛️ This includes algorithms based on lattice networks, resistant cryptographic signatures, and key exchange protocols capable of facing superior computing forces.',
    quantumSecurityNecessity: '⚠️ This security is necessary because the advancement of quantum computing represents a real risk for cryptocurrencies, banking systems, and all current digital infrastructure.',
    quantumSecurityExpansion: '✨ MXI adopts this technology for its first expansion phases, ensuring that its ecosystem remains secure, reliable, and prepared for the technological demands of the future, protecting both investors and projects and entrepreneurs.',
    
    // In Practice Tab Content - NEW KEYS (using quantum security content)
    inPracticeIntro: '🔐 MXI will integrate quantum security through certified post-quantum algorithms, encryption techniques resistant to quantum computing, and digital identity structures impossible to breach even against advanced attacks.',
    inPracticeTechnical: '⚛️ This includes algorithms based on lattice networks, resistant cryptographic signatures, and key exchange protocols capable of facing superior computing forces.',
    inPracticeNecessity: '⚠️ This security is necessary because the advancement of quantum computing represents a real risk for cryptocurrencies, banking systems, and all current digital infrastructure.',
    inPracticePresale: '✨ MXI adopts this technology from the presale phase to ensure that its ecosystem remains secure, reliable, and prepared for the technological demands of the future, protecting both investors and projects and entrepreneurs.',
    
    // Tokenomics Tab Content - NEW CONTENT
    tokenomicsIntro: 'The tokenomics of MXI has been designed to create a solid, scalable ecosystem prepared for the future. Our hybrid model combines three pillars: 1) real utility, 2) programmed algorithmic growth, and 3) community strengthening. This allows MXI to maintain stability, create progressive demand, and deliver benefits to both small and large investors.',
    
    // Section 1: Hybrid Model Structure
    tokenomicsSection1Title: '🔹 1. Hybrid Model Structure',
    tokenomicsSection1Intro: 'The economic model of MXI operates on three simultaneous mechanisms:',
    tokenomicsSection1ATitle: 'A. Controlled supply with intelligent release (Daily Vesting)',
    tokenomicsSection1ADesc: 'Each presale purchase enters an automatic daily release system, which:',
    tokenomicsSection1APoint1: 'Reduces selling pressure.',
    tokenomicsSection1APoint2: 'Increases price stability.',
    tokenomicsSection1APoint3: 'Guarantees constant liquidity flow.',
    tokenomicsSection1ABenefit: 'Direct benefit: even before listing, holders receive a token with growing organic demand.',
    tokenomicsSection1BTitle: 'B. Demand-driven growth + progressive burn',
    tokenomicsSection1BDesc: 'MXI integrates a dynamic adjustment algorithm, where:',
    tokenomicsSection1BPoint1: 'Part of the fees are burned.',
    tokenomicsSection1BPoint2: 'Another part is reinvested in liquidity and development.',
    tokenomicsSection1BModel: 'This generates a controlled deflationary model: with greater use → lower supply → higher valuation.',
    tokenomicsSection1CTitle: 'C. Utility token + decentralized economy',
    tokenomicsSection1CDesc: 'MXI will be used within the ecosystem for:',
    tokenomicsSection1CPoint1: 'Payments.',
    tokenomicsSection1CPoint2: 'Access to Web3 tools.',
    tokenomicsSection1CPoint3: 'Decentralized credits.',
    tokenomicsSection1CPoint4: 'Rewards.',
    tokenomicsSection1CPoint5: 'Quantum digital identity.',
    tokenomicsSection1CUtility: 'Real utility prevents MXI from depending solely on speculation.',
    
    // Section 2: Model Advantages
    tokenomicsSection2Title: '🔹 2. Model Advantages with Projected Figures',
    tokenomicsSection2Intro: 'Based on official prices:',
    tokenomicsSection2TableTitle: 'Stage | Price',
    tokenomicsSection2Phase1: 'Presale 1: 0.40 USDT',
    tokenomicsSection2Phase2: 'Presale 2: 0.70 USDT',
    tokenomicsSection2Phase3: 'Presale 3: 1.00 USDT',
    tokenomicsSection2Listing: 'Estimated listing price: 3.00 USDT',
    tokenomicsSection2ProjectionTitle: 'Initial valuation projection',
    tokenomicsSection2Projection1: 'Purchase at 0.40 → potential x7.5 at listing.',
    tokenomicsSection2Projection2: 'Purchase at 0.70 → x4.2.',
    tokenomicsSection2Projection3: 'Purchase at 1.00 → x3.',
    tokenomicsSection2Conclusion: 'These figures are strengthened by the hybrid model, which stabilizes the market avoiding sharp drops.',
    
    // Section 3: Comparison with Other Cryptocurrencies
    tokenomicsSection3Title: '🔹 3. Why is it superior to other cryptocurrency models?',
    tokenomicsSection3BTCTitle: 'BTC – pure scarcity',
    tokenomicsSection3BTCPro1: 'deflationary',
    tokenomicsSection3BTCCon1: 'no programmable utility',
    tokenomicsSection3BTCCon2: 'high volatility',
    tokenomicsSection3BTCConclusion: 'MXI combines scarcity plus real utility.',
    tokenomicsSection3ETHTitle: 'ETH – gas and smart contracts',
    tokenomicsSection3ETHPro1: 'large ecosystem',
    tokenomicsSection3ETHCon1: 'variable fees',
    tokenomicsSection3ETHConclusion: 'MXI integrates utility + low fees + quantum security.',
    tokenomicsSection3ADATitle: 'ADA – academic approach and scalability',
    tokenomicsSection3ADAPro1: 'solid structure',
    tokenomicsSection3ADACon1: 'slow adoption',
    tokenomicsSection3ADAConclusion: 'MXI prioritizes immediate use (payments, loans, identity).',
    tokenomicsSection3SOLTitle: 'SOL – high speed',
    tokenomicsSection3SOLPro1: 'fast transactions',
    tokenomicsSection3SOLCon1: 'history of crashes and centralization',
    tokenomicsSection3SOLConclusion: 'MXI combines speed with quantum security + economic stability.',
    
    // Section 4: Direct Benefits for Investors
    tokenomicsSection4Title: '🔹 4. Direct Benefits for Investors',
    tokenomicsSection4ShortTerm: 'Short term',
    tokenomicsSection4ShortPoint1: 'Gain from low presale price.',
    tokenomicsSection4ShortPoint2: 'Daily acquisition as controlled flow.',
    tokenomicsSection4MediumTerm: 'Medium term',
    tokenomicsSection4MediumPoint1: 'First use cases of the token.',
    tokenomicsSection4MediumPoint2: 'Ecosystem expansion: MXI card, payments, Web3 services.',
    tokenomicsSection4LongTerm: 'Long term',
    tokenomicsSection4LongPoint1: 'Decentralized loans.',
    tokenomicsSection4LongPoint2: 'Community governance.',
    tokenomicsSection4LongPoint3: 'Price appreciation through burn + real adoption.',
    
    // Conclusion
    tokenomicsConclusionTitle: 'MXI: a model designed to grow with its community',
    tokenomicsConclusionText: 'The more the ecosystem grows, the stronger the token value becomes and everyone wins: entrepreneurs, investors, and real users.',
    
    // Investor Profiles - En la Práctica Tab
    investorProfilesIntro: 'Below are three investor profiles and how MXI could generate real utility for them at different time horizons, using projected growth figures.',
    
    // Basic Investor
    basicInvestorTitle: '🟦 1. Basic Investor (Direct Purchase – No Challenge Participation)',
    shortTermLabel: 'Short Term (0–6 months)',
    basicInvestorShortTerm: 'Purchase in presale at 0.40 – 0.70 – 1.00 USDT. If the token lists at 3 USDT, their immediate utility would be:',
    basicInvestorTable: 'Purchase Price | Potential Gain at Listing (3 USDT) | Approximate %\n0.40 | 650% | +650%\n0.70 | 328% | +328%\n1.00 | 200% | +200%',
    basicInvestorExample: 'Practical Example: Purchase 1,000 MXI at 0.40 = 400 USDT → At listing at 3 USDT → 3,000 USDT.',
    mediumTermLabel: 'Medium Term (6–18 months)',
    basicInvestorMediumTerm: 'Daily vesting release, which reduces selling pressure and increases stability. Can use MXI within the ecosystem for:',
    basicInvestorMediumPoint1: '✔ Card payments',
    basicInvestorMediumPoint2: '✔ Reduced commissions',
    basicInvestorMediumPoint3: '✔ Early participation in new MXI products',
    longTermLabel: 'Long Term (18+ months)',
    basicInvestorLongTerm: 'If MXI fulfills the goal of a decentralized economy, the token gains:',
    basicInvestorLongPoint1: '✔ Utility value',
    basicInvestorLongPoint2: '✔ Community value',
    basicInvestorLongPoint3: '✔ Possible appreciation through adoption',
    
    // Participative Investor
    participativeInvestorTitle: '🟩 2. Participative Investor (Purchase + Daily Vesting + Referrals)',
    participativeInvestorShortTerm: 'Obtains the same potential gains as the basic investor.',
    referralBonusLabel: 'REFERRAL BONUS:',
    participativeInvestorBonus: 'If you invite 10 people who purchase 500 USDT each: Assuming a 5% bonus → earn 250 USDT additional in MXI. This MXI also enters daily vesting.',
    participativeInvestorMediumTerm: 'With daily vesting, receives constant releases.',
    participativeInvestorExample: 'Example: Purchase 2,000 USDT → receive 2,000 MXI at 1 USDT. Daily vesting at 1% (example) = 20 MXI daily. If the price rises from 1 to 3 USDT, each release is worth more.',
    participativeInvestorLongTerm: 'Your portfolio grows through 3 simultaneous paths:',
    participativeInvestorLongPoint1: '• Price appreciation',
    participativeInvestorLongPoint2: '• Vesting release',
    participativeInvestorLongPoint3: '• MXI accumulated from active referrals',
    participativeInvestorConclusion: 'This is the profile with the greatest compound growth potential.',
    
    // Strategic Investor
    strategicInvestorTitle: '🟧 3. Strategic Investor (Purchase + Vesting + Referrals + Optional Challenges)',
    strategicInvestorIntro: 'This profile leverages all growth sources of the MXI ecosystem.',
    strategicInvestorShortTerm: 'Immediate profitability from presale → listing. Additional bonuses for completing challenges:',
    strategicInvestorChallengePoint1: '• Volume challenges',
    strategicInvestorChallengePoint2: '• Community missions',
    strategicInvestorChallengePoint3: '• Provide liquidity at launch',
    strategicInvestorExample: 'Example: Purchase 5,000 USDT at 0.40 = 12,500 MXI. Earn an additional 10% for challenges = 1,250 extra MXI. If the price rises to 3 USDT → those 1,250 MXI are worth 3,750 USDT.',
    strategicInvestorMediumTerm: 'Large daily flow from vesting due to higher purchase volume. Level up in the ecosystem → more benefits:',
    strategicInvestorMediumPoint1: '✔ Priority access to products',
    strategicInvestorMediumPoint2: '✔ Increased rewards',
    strategicInvestorMediumPoint3: '✔ More referral bonuses',
    strategicInvestorLongTerm: 'Participates in ecosystem governance. Access to private rounds of projects integrated into MXI.',
    strategicInvestorBenefits: 'Extreme compound benefit:',
    strategicInvestorBenefitPoint1: '✔ MXI price',
    strategicInvestorBenefitPoint2: '✔ Vesting',
    strategicInvestorBenefitPoint3: '✔ Challenges',
    strategicInvestorBenefitPoint4: '✔ Referrals',
    strategicInvestorBenefitPoint5: '✔ Network growth',
    
    // Meta Tab Content - NEW CONTENT
    metaTitle: 'Our Goal',
    metaIntro: '🎯 Our goal is to build a real, decentralized, and sustainable economy, designed to free people and businesses from dependence on the traditional financial system. Our purpose is simple but powerful: to create an ecosystem where growth is driven by the community, not by central institutions, focused primarily on the Latin American public, their needs and strengths.',
    metaVision: '💎 MXI is born with a clear vision: to democratize economic opportunities. That is why our ecosystem will integrate real solutions such as peer-to-peer lending systems, direct support for entrepreneurs, tools for investors, and liquidity mechanisms that favor community development. When the community grows, MXI grows; and when MXI advances, everyone wins.',
    metaModel: '🔗 We seek to build an economic model in which value is not controlled by a few, but distributed among those who actively participate. Our approach combines advanced blockchain technology, next-generation quantum security, and an infrastructure designed to scale globally, creating a secure, transparent environment prepared for the challenges of the future.',
    metaObjective: '🚀 The ultimate goal is to consolidate MXI as a development engine:',
    metaObjectivePoint1: '• A real bridge for entrepreneurs who need financing',
    metaObjectivePoint2: '• A solid alternative for investors seeking decentralized growth',
    metaObjectivePoint3: '• A self-sustaining ecosystem in which each contribution strengthens the entire system',
    metaConclusion: '✨ MXI is not just a token: it is a shared vision. And if the community supports it, MXI becomes an economic force capable of transforming realities.',
    
    // Why Buy Tab Content - NEW CONTENT
    whyBuyTitle: 'Why Buy MXI?',
    whyBuyIntro: '💎 Buying MXI in presale is a strategic opportunity because it allows you to enter before the ecosystem is fully operational, accessing prices that will not be repeated.',
    whyBuyReason1: '1️⃣ Preferential Price and Early Advantage',
    whyBuyReason1Desc: 'The token is available from 0.40 USDT, with optimistic projections between 4.5 and 8 USDT as payments, card, and commercial expansion are activated.',
    whyBuyReason2: '2️⃣ Limited Issuance and High Projected Demand',
    whyBuyReason2Desc: 'Only 50 million tokens will exist. Real utility (payments, tournaments, rewards, card) increases future demand pressure.',
    whyBuyReason3: '3️⃣ Ecosystem with Immediate Utility',
    whyBuyReason3Desc: 'You are not just buying a token: you are buying access to a network that you can use to pay, compete, send money, and consume services.',
    whyBuyReason4: '4️⃣ Integrated Quantum Security',
    whyBuyReason4Desc: 'MXI is born prepared for the future, with advanced protection technology that increases its differential value compared to other projects.',
    whyBuyReason5: '5️⃣ MXI Card: Real Token Use',
    whyBuyReason5Desc: 'Your MXI is not stored: you can use it at any merchant, instantly.',
    whyBuyReason6: '6️⃣ Project Designed to Grow in the Short Term',
    whyBuyReason6Desc: 'The roadmap deploys functions quickly: active vesting, tournaments, tools, merchants, marketplace, and future migration to own blockchain.',
    whyBuyReason7: '7️⃣ Advantage of Being Among the First',
    whyBuyReason7Desc: 'Entering early is not just more economical: it positions you before growth, mass adoption, and international expansion.',
    whyBuyConclusion: '✨ MXI is a presale opportunity for those who want to participate at the beginning of an ecosystem designed with vision, technology, and real utility.',
    investmentAdvantages: 'Investment Advantages',
    growthPotential: 'Growth Potential',
    growthPotentialDesc: 'Early entry at preferential prices',
    limitedSupply: 'Limited Supply',
    limitedSupplyDesc: 'Only 50 million tokens',
    realUtility: 'Real Utility',
    realUtilityDesc: 'Payments, tournaments, and card',
    globalCommunity: 'Global Community',
    globalCommunityDesc: 'Growing international network',
    
    // How It Works Tab - UPDATED CONTENT
    howItWorksTitle: 'How MXI Works',
    howItWorksIntro: '🚀 MXI functions as an expanding ecosystem designed to grow in phases, ensuring that each stage drives the next. Today we are in presale, the earliest and most strategic phase of the project, where the first participants gain early access to the token before its full integration into the system.',
    step1Title: '1️⃣ Early Token Acquisition (Presale)',
    step1Description: 'During this stage, users purchase MAXCoin (MXI) at preferential prices (0.40, 0.70, and 1.00 USDT). These tokens are not released all at once: they enter an automated vesting system that guarantees stability and controlled distribution.',
    step2Title: '2️⃣ Smart Daily Vesting',
    step2Description: 'Acquired tokens are released through a Daily Vesting of 3% monthly, calculated and released minute by minute. This mechanism ensures three things:\n\n• Progressive circulation\n• Market protection\n• Greater price sustainability\n\nIn other words, you receive your tokens constantly and predictably without saturating the supply.',
    step3Title: '3️⃣ Active Ecosystem Under Construction',
    step3Description: 'While users receive MXI, the team develops and integrates core components:\n\n• MXI App: balance management, vesting, expansion network, and internal tools\n• Skill Tournaments: rewards generated by real participation\n• MXI Pay: instant conversion payment system\n• MXI Card: will allow you to use your balance at any compatible merchant\n• Quantum Security: post-quantum algorithms that shield transactions and keys\n\nAll of this is activated in stages as the presale is completed.',
    step4Title: '4️⃣ Market Entry and Expansion Phase',
    step4Description: 'Once the presale ends and the app is in full operation, MXI begins its growth cycle:\n\n• Daily token utility\n• Merchant integration\n• Internal marketplace\n• International expansion\n• Future migration to its own blockchain\n\nThis is key: valuation is driven by use, not speculation.\n\n✨ MXI functions as a living system: it allows you to enter early, receive your token in an orderly manner, and accompany the growth of an ecosystem designed to scale in the coming months.',
    keyBenefits: 'Key Benefits',
    instantTransactions: 'Instant Transactions',
    instantTransactionsDesc: 'Fast and secure transactions on the blockchain',
    maximumSecurity: 'Maximum Security',
    maximumSecurityDesc: 'Protected with quantum encryption technology',
    globalAccess: 'Global Access',
    globalAccessDesc: 'Available 24/7 from anywhere in the world',
    
    // What is MXI? Tab - NEW CONTENT
    whatIsMXITitle: 'What is MXI?',
    whatIsMXIIntro: 'MXI is a crypto-technological project under construction, currently in its strategic pre-launch phase, allowing early participants to access an ecosystem designed to expand rapidly in the coming months. Its native token, MAXCoin (MXI), has a limited issuance of 50 million and an economic model based on real utility, daily vesting, and programmed liquidity.',
    whatIsMXIEarlyStage: 'During this early stage, MXI is being structured to become a comprehensive network of payments, rewards, skill tournaments, merchant integration, and a card linked to the MXI wallet, which will allow balances to be used at any time. The project also incorporates a quantum security system aimed at protecting transactions and keys against emerging technologies, ensuring an ecosystem prepared for the future.',
    whatIsMXIPresale: 'In presale, MXI offers access to initial prices lower than the projected value of the token once the main functions of the ecosystem are activated. This is the phase where the foundation is built: community, initial liquidity, internal mechanisms, and progressive connection with the project tools.',
    whatIsMXINotJustToken: 'MXI is not just a token: it is a model designed to grow fast, integrate real services, and position itself as a digital infrastructure ready to scale in the short term.',
    
    // How MXI Works - NEW CONTENT
    howMXIWorksTitle: 'How MXI Works (Technical-Persuasive Version)',
    howMXIWorksIntro: 'MXI operates through a modular system of components that are activated progressively:',
    howMXIWorksStep1Title: '1. Presale with Early Access',
    howMXIWorksStep1Desc: 'Users acquire MXI at preferential prices before the official launch. From day one, the system generates a simulated version of the balance that then enters vesting.',
    howMXIWorksStep2Title: '2. Daily Vesting of 3% Monthly',
    howMXIWorksStep2Desc: 'Tokens are released fractionally minute by minute, avoiding concentrations and maintaining controlled circulation.',
    howMXIWorksStep3Title: '3. Expanding Internal Ecosystem',
    howMXIWorksStep3Desc: 'Includes:',
    howMXIWorksStep3Point1: '- Payments between users',
    howMXIWorksStep3Point2: '- Skill tournaments',
    howMXIWorksStep3Point3: '- Participation rewards',
    howMXIWorksStep3Point4: '- Tools for growth and community',
    howMXIWorksStep4Title: '4. Linked Card',
    howMXIWorksStep4Desc: 'Will allow using MXI or USDT directly in physical and digital merchants, turning token utility into something immediate and practical.',
    howMXIWorksStep5Title: '5. Quantum Security',
    howMXIWorksStep5Desc: 'Encryption resistant to emerging technologies to protect transactions, assets, and private keys.',
    howMXIWorksStep6Title: '6. Progressive Expansion',
    howMXIWorksStep6Desc: 'The project will migrate to its own blockchain when the community and infrastructure justify it, increasing speed, scalability, and efficiency.',
    howMXIWorksConclusion: 'MXI functions as a living ecosystem that activates in stages, designed to increase utility, adoption, and value as it evolves.',
    
    // Profile Screen
    profile: 'Profile',
    totalBalance: 'Total Balance',
    mxiPurchased: 'MXI Purchased',
    mxiPurchasedLabel: 'Purchased',
    mxiCommissionsLabel: 'Commissions',
    mxiVestingLabel: 'Vesting',
    mxiTournamentsLabel: 'Tournaments',
    adminPanel: 'Admin Panel',
    manageUsers: 'Manage users and system',
    memberSince: 'Member since',
    mxiCommissions: 'MXI Commissions',
    rejected: 'Rejected',
    areYouSureLogout: 'Are you sure you want to log out?',
    approved: 'Approved',
    notSubmitted: 'Not Submitted',
    editProfile: 'Edit Profile',
    updateYourInfo: 'Update your information',
    kycVerification: 'KYC Verification',
    viewYieldGeneration: 'View yield generation',
    withdrawalHistory: 'Withdrawal History',
    viewPreviousWithdrawals: 'View previous withdrawals',
    challengeHistory: 'Challenge History',
    viewGameRecords: 'View game records',
    getHelp: 'Get help',
    vestingAndYield: 'Vesting & Yield',
    
    // Edit Profile Screen
    editProfileText: 'Edit Profile',
    profileLockedText: 'Profile Locked',
    profileCannotBeEditedText: 'Your profile cannot be edited while your KYC status is {{status}}.',
    profileInfoCanOnlyBeModifiedText: 'Profile information can only be modified before KYC submission or after rejection.',
    backToProfileText: 'Back to Profile',
    importantNoticeText: 'Important Notice',
    canOnlyEditBeforeKYCText: 'You can only edit your profile information before submitting KYC verification or if your KYC was rejected.',
    personalInformationText: 'Personal Information',
    fullNameText: 'Full Name',
    enterYourFullNameText: 'Enter your full name',
    enterFullLegalNameText: 'Enter your full legal name as it appears on your ID',
    idNumberText: 'ID Number',
    enterYourIDNumberText: 'Enter your ID number',
    enterNationalIDText: 'Enter your national ID or passport number',
    residentialAddressText: 'Residential Address',
    enterYourResidentialAddressText: 'Enter your residential address',
    enterCompleteAddressText: 'Enter your complete residential address',
    emailAndReferralCannotChangeText: 'Email and referral code cannot be changed',
    emailAddressReadOnlyText: 'Email Address (Read-only)',
    referralCodeReadOnlyText: 'Referral Code (Read-only)',
    saveChangesText: 'Save Changes',
    pleaseEnterFullNameText2: 'Please enter your full name',
    pleaseEnterAddressText: 'Please enter your address',
    pleaseEnterIDNumberText: 'Please enter your ID number',
    idNumberAlreadyRegisteredText: 'This ID number is already registered by another user',
    successText2: 'Success',
    profileUpdatedSuccessfullyText: 'Profile updated successfully',
    failedToUpdateProfileText: 'Failed to update profile. Please try again.',
    
    // KYC Verification Screen
    completeYourKYCVerification: 'Complete your KYC verification',
    loadingKYCData: 'Loading KYC data...',
    verificationStatus: 'Verification Status',
    verifiedOn: 'Verified on',
    yourKYCIsBeingReviewed: 'Your KYC verification is being reviewed by our team. This usually takes 24-48 hours.',
    rejectionReason: 'Rejection Reason',
    pleaseCorrectIssues: 'Please correct the issues and resubmit your verification.',
    whyKYCRequired: 'Why is KYC Required?',
    kycMandatoryForWithdrawals: 'KYC is mandatory for withdrawals',
    helpPreventFraud: 'Helps prevent fraud and money laundering',
    ensureCompliance: 'Ensures compliance with regulations',
    protectYourAccount: 'Protects your account and funds',
    oneTimeVerification: 'One-time verification process',
    personalInformation: 'Personal Information',
    fullLegalName: 'Full Legal Name',
    enterFullNameAsOnID: 'Enter your full name as it appears on your ID',
    documentType: 'Document Type',
    nationalID: 'National ID',
    passport: 'Passport',
    driversLicense: "Driver's License",
    documentNumber: 'Document Number',
    enterYourDocumentNumber: 'Enter your document number',
    frontDocument: 'Front of Document',
    uploadClearPhotoOfFront: 'Upload a clear photo of the front of your document',
    uploading: 'Uploading...',
    tapToChange: 'Tap to change',
    tapToUploadFront: 'Tap to upload front',
    backDocument: 'Back of Document',
    uploadClearPhotoOfBack: 'Upload a clear photo of the back of your document',
    tapToUploadBack: 'Tap to upload back',
    submitting: 'Submitting...',
    submitKYCVerification: 'Submit KYC Verification',
    yourDataIsSecure: 'Your Data is Secure',
    dataEncryptedAndSecure: 'All your data is encrypted and stored securely. We never share your information with third parties.',
    kycVerified: 'KYC Verified',
    identityVerifiedSuccessfully: 'Your identity has been verified successfully. You can now make withdrawals.',
    loadingUserData: 'Loading user data...',
    pleaseEnterFullNameText: 'Please enter your full name',
    pleaseEnterDocumentNumber: 'Please enter your document number',
    pleaseUploadFrontDocument: 'Please upload the front of your document',
    pleaseUploadBackDocument: 'Please upload the back of your document',
    authenticationErrorText: 'Authentication error. Please log in again.',
    errorSubmittingKYC: 'Error submitting KYC verification. Please try again.',
    kycSubmittedSuccessfully: 'KYC Submitted Successfully',
    kycUnderReview: 'Your KYC verification has been submitted and is under review. You will be notified once it is approved.',
    submissionError: 'Submission Error',
    errorUploadingDocument: 'Error uploading document. Please try again.',
    successUploadDocument: 'Upload Successful',
    frontDocumentUploaded: 'Front document uploaded successfully',
    backDocumentUploaded: 'Back document uploaded successfully',
    uploadError: 'Upload Error',
    
    // Support Screen
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
    describeIssueInDetailText: 'Describe your issue in detail',
    sendMessageButtonText: 'Send Message',
    messageSentSuccessText: 'Your message has been sent successfully. Our team will respond within 24-48 hours.',
    failedToSendMessageErrorText: 'Failed to send message. Please try again.',
    noMessagesYetTitleText: 'No Messages Yet',
    createSupportRequestMessageText: 'Create a support request to get help from our team',
    messageDetail: 'Message Detail',
    messageDetailComingSoonText: 'Message detail view coming soon',
    repliesCountText: 'replies',
    failedToLoadMessages: 'Failed to load messages',
    pleaseEnterSubjectAndMessageText: 'Please enter both subject and message',
    
    // Admin Panel
    backToHome: 'Back to Home',
    adminDashboard: 'Admin Dashboard',
    welcome: 'Welcome',
    dangerZone: 'DANGER ZONE',
    dangerZoneSubtitle: 'Reset all MXI counters to 0 (INCLUDING ADMIN). Referral relationships will be preserved. This action is IRREVERSIBLE.',
    resetAll: 'Reset All',
    presaleMetrics: 'Presale Metrics',
    totalSold: 'Total Sold',
    totalMembers: 'Total Members',
    progress: 'Progress',
    users: 'Users',
    active: 'Active',
    totalUSDT: 'Total USDT',
    totalMXI: 'Total MXI',
    quickActions: 'Quick Actions',
    manualVerifications: 'Manual Verifications',
    advancedManagement: 'Advanced Management',
    creditManualPayment: 'Credit Manual Payment',
    approveKYC: 'Approve KYC',
    withdrawals: 'Withdrawals',
    supportMessages: 'Support Messages',
    basicUsers: 'Basic Users',
    vestingAnalytics: 'Vesting Analytics',
    settings: 'Settings',
    resetSystemTitle: 'Reset Entire System?',
    resetSystemMessage: 'This action is IRREVERSIBLE and will reset all counters to 0 (INCLUDING ADMIN):',
    resetWarning1: 'All MXI and USDT balances will be set to 0 (including admin)',
    resetWarning2: 'All commissions will be deleted',
    resetWarning3: 'All contributions will be deleted',
    resetWarning4: 'All withdrawals will be deleted',
    resetWarning5: 'All payments and orders will be deleted',
    resetWarning6: 'Presale metrics will be reset to 0',
    resetWarning7: 'All vesting will be deleted',
    resetWarning8: 'Admin balance will also be reset to 0',
    resetPreserved: 'Referral relationships WILL BE PRESERVED',
    typeResetToConfirm: 'Type "RESET" to confirm:',
    confirmReset: 'Confirm Reset',
    mustTypeReset: 'You must type "RESET" to confirm',
    systemReset: 'System Reset',
    systemResetSuccess: 'The page will reload to update the data.',
    updateComplete: 'Update Complete',
    updateCompleteMessage: 'All data has been updated. Admin balance is now 0.',
    resetError: 'Error resetting system',
    accessDenied: 'Access Denied',
    noAdminPermissions: 'You do not have administrator permissions',
    
    // Rewards Screen
    rewards: 'Rewards',
    loadingRewards: 'Loading rewards...',
    earnMXIMultipleWays: 'Earn MXI in multiple ways',
    totalMXIEarned: 'Total MXI Earned',
    bonus: 'Bonus',
    rewardPrograms: 'Reward Programs',
    participationBonus: 'Participation Bonus',
    participateInWeeklyDrawings: 'Participate in weekly drawings',
    generatePassiveIncome: 'Generate passive income',
    live: 'Live',
    referralSystem: 'Referral System',
    earnCommissionsFrom3Levels: 'Earn commissions from 3 levels',
    moreRewardsComingSoon: 'More Rewards Coming Soon!',
    workingOnNewRewards: 'We are working on new ways to reward our community',
    tournamentsAndCompetitions: 'Tournaments and Competitions',
    achievementBonuses: 'Achievement Bonuses',
    loyaltyRewards: 'Loyalty Rewards',
    specialEvents: 'Special Events',
    benefitsOfRewards: 'Benefits of Rewards',
    earnAdditionalMXI: 'Earn additional MXI beyond your initial purchase',
    participateInExclusiveDrawings: 'Participate in exclusive drawings and bonuses',
    generateAutomaticPassiveIncome: 'Generate automatic passive income through vesting',
    bonusesForActiveReferrals: 'Bonuses for maintaining active referrals',
    rewardsForContinuedParticipation: 'Rewards for continued participation',
    maximizeYourRewards: 'Maximize Your Rewards',
    keepAtLeast5ActiveReferrals: 'Keep at least 5 active referrals',
    participateRegularlyInBonus: 'Participate regularly in the Bonus MXI',
    activateVestingForPassiveIncome: 'Activate vesting for passive income',
    shareYourReferralCode: 'Share your referral code with friends',
    
    // Lottery/Bonus Participation Screen
    bonusParticipation: 'Participation Bonus',
    loadingBonusText: 'Loading bonus...',
    failedToLoadBonusData: 'Failed to load bonus data',
    noActiveBonusRoundText: 'No active bonus round',
    retryButton: 'Retry',
    roundText: 'Round',
    openText: 'Open',
    lockedText: 'Locked',
    prizePoolText: 'Prize Pool',
    totalPoolText: 'Total Pool',
    ticketsSoldText: 'Tickets Sold',
    ticketPriceText: 'Ticket Price',
    yourTicketsText: 'Your Tickets',
    availableMXIText: 'Available MXI',
    purchaseTicketsText: 'Purchase Tickets',
    buyBetween1And20TicketsText: 'Buy between 1 and 20 tickets',
    buyTicketsText: 'Buy Tickets',
    howItWorksBonusText: 'How It Works',
    eachTicketCosts2MXIText: 'Each ticket costs 2 MXI',
    buyBetween1And20TicketsPerRoundText: 'Buy between 1 and 20 tickets per round',
    roundLocksWhen1000TicketsSoldText: 'Round locks when 1,000 tickets are sold',
    winnerReceives90PercentText: 'Winner receives 90% of the pool',
    winnerAnnouncedOnSocialMediaText: 'Winner announced on social media',
    purchaseIsFinalNoRefundsText: 'Purchase is final, no refunds',
    numberOfTicketsText: 'Number of Tickets',
    enterQuantityText: 'Enter quantity',
    ticketsText: 'Tickets',
    pricePerTicketText: 'Price per Ticket',
    totalCostText: 'Total Cost',
    cancelButton: 'Cancel',
    continueButton: 'Continue',
    selectPaymentSourceText: 'Select Payment Source',
    chooseWhichMXIBalanceText: 'Choose which MXI balance to use',
    mxiPurchasedSourceText: 'MXI Purchased',
    mxiFromCommissionsSourceText: 'MXI from Commissions',
    mxiFromChallengesSourceText: 'MXI from Challenges',
    pleaseEnterValidQuantity: 'Please enter a valid quantity (1-20)',
    insufficientBalance: 'Insufficient Balance',
    insufficientBalanceNeedForTicketsText: 'You need {{needed}} MXI for {{quantity}} tickets but only have {{available}} MXI available',
    insufficientBalanceInSourceText: 'Insufficient balance in {{source}}. Available: {{available}} MXI, Needed: {{needed}} MXI',
    failedToDeductBalance: 'Failed to deduct balance',
    failedToPurchaseTicketsText: 'Failed to purchase tickets',
    successTitle: 'Success',
    successfullyPurchasedTicketsText: 'Successfully purchased {{count}} tickets for {{cost}} MXI from {{source}}',
    onlyUsePurchasedCommissionsOrTournamentsText: 'Only use MXI from purchases, commissions, or tournaments to buy tickets',
    
    // Admin - Participation Bonus Management
    participationBonusManagement: 'Participation Bonus Management',
    manageBonusSettings: 'Manage bonus settings and participants',
    bonusSettings: 'Bonus Settings',
    currentRound: 'Current Round',
    roundNumber: 'Round Number',
    maxParticipants: 'Max Participants',
    ticketsSold: 'Tickets Sold',
    totalPool: 'Total Pool',
    prizePool: 'Prize Pool',
    roundStatus: 'Round Status',
    open: 'Open',
    locked: 'Locked',
    drawn: 'Drawn',
    completed: 'Completed',
    updateSettings: 'Update Settings',
    resetBonus: 'Reset Bonus',
    downloadParticipants: 'Download Participants',
    maxParticipantsLabel: 'Maximum Participants',
    ticketPriceLabel: 'Ticket Price (MXI)',
    enterMaxParticipants: 'Enter maximum participants',
    enterTicketPrice: 'Enter ticket price',
    updateBonusSettings: 'Update Bonus Settings',
    resetBonusConfirmTitle: 'Reset Participation Bonus?',
    resetBonusConfirmMessage: 'This will:\n\n• Close the current round\n• Create a new round with current settings\n• Reset all counters to 0\n\nThis action cannot be undone.',
    resetBonusSuccess: 'Bonus reset successfully',
    resetBonusError: 'Error resetting bonus',
    updateSettingsSuccess: 'Settings updated successfully',
    updateSettingsError: 'Error updating settings',
    downloadingParticipants: 'Downloading participants...',
    noParticipantsYet: 'No participants yet',
    participantsList: 'Participants List',
    downloadComplete: 'Download Complete',
    participantsDownloaded: 'Participants data downloaded successfully',
    downloadError: 'Error downloading participants',
    bonusManagementActions: 'Bonus Management Actions',
    resetBonusButton: 'Reset Bonus to 0',
    updateLimitsButton: 'Update Limits',
    downloadDataButton: 'Download Participant Data',
    currentBonusStats: 'Current Bonus Statistics',
    participantsCount: 'Participants',
    totalTicketsSold: 'Total Tickets Sold',
    currentPrizePool: 'Current Prize Pool',
    settingsUpdatedSuccessfully: 'Settings updated successfully',
    bonusResetSuccessfully: 'Bonus reset successfully. New round created.',
    confirmResetBonus: 'Confirm Reset Bonus',
    typeResetBonusToConfirm: 'Type "RESET BONUS" to confirm:',
    mustTypeResetBonus: 'You must type "RESET BONUS" to confirm',
    participantData: 'Participant Data',
    ticketNumber: 'Ticket Number',
    userName: 'User Name',
    userEmail: 'User Email',
    purchaseDate: 'Purchase Date',
    ticketQuantity: 'Quantity',
    changesWillAffectCurrentRoundText: 'Changes will affect the current round immediately',
    more: 'more',
    locale: 'en',
    
    // Vesting Screen
    mxiVestingBalance: 'MXI Vesting Balance',
    loadingVestingDataText: 'Loading vesting data...',
    vestingSourceTitle: 'Vesting Source',
    vestingSourceDescriptionText: 'Vesting is generated only from MXI purchased directly. Commissions and tournament winnings do not generate vesting.',
    mxiPurchasedVestingBaseText: 'MXI Purchased (Vesting Base)',
    mxiInVestingText: 'MXI in Vesting',
    availableForWithdrawalText: 'Available for withdrawal',
    blockedUntilLaunchText: 'Blocked until launch',
    daysRemainingText: 'days remaining',
    balanceBlockedTitle: 'Balance Blocked',
    balanceBlockedDescriptionText: 'Your vesting balance is blocked until the official MXI launch. After launch, you will be able to withdraw your MXI in progressive releases.',
    timeUntilLaunchText: 'Time Until Launch',
    releasedText: 'Released',
    vestingInformationText: 'Vesting Information',
    releasePercentageText: 'Release Percentage',
    everyTenDaysText: 'every 10 days',
    releasesCompletedText: 'Releases Completed',
    nextReleaseText: 'Next Release',
    withdrawalStatusText: 'Withdrawal Status',
    enabledText: 'Enabled',
    blockedUntilLaunchShortText: 'Blocked until launch',
    whatIsVestingText: 'What is Vesting?',
    vestingDescriptionText: 'Vesting is a system that locks your purchased MXI until the official launch. This ensures stability and long-term value for the token.',
    vestingReleaseInfoText: 'After launch, {{percentage}}% of your vesting balance is released every 10 days, allowing you to gradually withdraw your MXI.',
    vestingReleaseInfoPreLaunchText: 'After launch, {{percentage}}% of your vesting balance will be released every 10 days, allowing you to gradually withdraw your MXI.',
    vestingImportantNoteText: '⚠️ Important: Only MXI purchased directly generates vesting. Commissions and tournament winnings are available immediately (with requirements).',
    withdrawMXIText: 'Withdraw MXI',
    withdrawVestingBalanceText: 'Withdraw your vesting balance',
    
    // Referrals Page
    commissionsByReferrals: 'Commissions by Referrals',
    yourReferralCode: 'Your Referral Code',
    shareCode: 'Share Code',
    shareReferralCode: 'Join MXI with my referral code',
    commissionBalance: 'Commission Balance',
    totalEarnedByReferrals: 'Total Earned by Referrals',
    allCommissionsCreditedMXI: 'All commissions are credited directly in MXI',
    yourReferrals: 'Your Referrals',
    level: 'Level',
    referralsText: 'referrals',
    activeReferralsLevel1: 'Active Referrals (Level 1)',
    howCommissionsWork: 'How Commissions Work',
    earn5PercentLevel1: 'Earn 5% in MXI from Level 1 referrals',
    earn2PercentLevel2: 'Earn 2% in MXI from Level 2 referrals',
    earn1PercentLevel3: 'Earn 1% in MXI from Level 3 referrals',
    commissionsCalculatedOnMXI: 'Commissions are calculated on MXI purchases',
    need5ActiveReferrals: 'Need 5 active referrals to withdraw',
    minimumWithdrawalIs50MXI: 'Minimum withdrawal is 50 MXI',
    viewWithdrawalHistory: 'View Withdrawal History',
    
    // Embajadores MXI
    ambassadorsMXI: 'MXI Ambassadors',
    earnBonusesForReferrals: 'Earn bonuses for your referrals',
    earnAdditionalBonusesForReferrals: 'Earn additional bonuses for your referrals',
    yourCurrentLevel: 'Your Current Level',
    accumulatedValidPurchases: 'Accumulated Valid Purchases',
    fromDirectReferrals: 'From direct referrals (Level 1)',
    progressToNextLevel: 'Progress to Next Level',
    withdrawableBonus: 'Withdrawable Bonus',
    cumulativeBonusesAvailable: 'Cumulative bonuses available',
    withdrawBonus: 'Withdraw Bonus',
    allLevels: 'All Levels',
    withdrawalRequirements: 'Withdrawal Requirements',
    levelMustBeFullyAchieved: 'Level must be fully achieved',
    mustHaveApprovedKYC: 'Must have approved KYC',
    mustHaveMinimum1PersonalPurchase: 'Must have minimum 1 personal purchase',
    withdrawalMethodUSDTTRC20Only: 'Withdrawal method: USDT TRC20 only',
    importantInformation: 'Important Information',
    bonusesAdditionalTo5Percent: 'Bonuses are additional to the 5% referral commission',
    allBonusesAreCumulative: 'All bonuses are cumulative',
    onlyLevel1ReferralPurchasesCount: 'Only Level 1 referral purchases count',
    minimumAmountPerPurchase50USDT: 'Minimum amount per purchase: 50 USDT',
    onlyPresalePurchasesPaidInUSDT: 'Only presale purchases paid in USDT',
    usdtTRC20Address: 'USDT TRC20 Address',
    enterYourTRC20Address: 'Enter your TRC20 address',
    onlyUSDTTRC20WithdrawalsAllowed: 'Only USDT TRC20 withdrawals allowed',
    confirmBonusWithdrawal: 'Confirm Bonus Withdrawal',
    withdrawalRequestSentSuccessfully: 'Withdrawal request sent successfully',
    noBonusesAvailableToWithdraw: 'No bonuses available to withdraw',
    addressRequired: 'Address Required',
    pleaseEnterYourUSDTTRC20Address: 'Please enter your USDT TRC20 address',
    invalidAddress: 'Invalid Address',
    pleaseEnterValidTRC20Address: 'Please enter a valid USDT TRC20 address (must start with T and be 34 characters)',
    noLevelAchievedYet: 'You have not achieved any level yet',
    needValidPurchasesFromLevel1: 'You need {{amount}} USDT in valid purchases from Level 1 referrals',
    
    // Deposit Page
    deposit: 'Deposit',
    buyMXIWithMultipleOptions: 'Buy MXI with multiple options',
    currentBalance: 'Current Balance',
    usdtContributed: 'USDT Contributed',
    currentPresalePhase: 'Current Presale Phase',
    activePhase: 'Active Phase',
    phaseOf: 'Phase {{current}} of {{total}}',
    currentPrice: 'Current Price',
    perMXI: 'per MXI',
    tokensSold: 'Tokens Sold',
    untilNextPhase: 'Until Next Phase',
    paymentOptions: 'Payment Options',
    chooseYourPreferredPaymentMethod: 'Choose your preferred payment method',
    multiCryptoPayment: 'Multi-Crypto Payment',
    availableCryptocurrencies: 'Available Cryptocurrencies',
    bitcoinEthereumUSDTUSDC: 'Bitcoin, Ethereum, USDT, USDC',
    multipleNetworks: 'Multiple Networks',
    automaticConfirmation: 'Automatic Confirmation',
    directUSDTPayment: 'Direct USDT Payment',
    manualUSDTTransfer: 'Manual USDT Transfer',
    usdtOnMultipleNetworks: 'USDT on multiple networks',
    manualVerificationAvailable: 'Manual verification available',
    dedicatedSupport: 'Dedicated Support',
    manualPaymentVerification: 'Manual Payment Verification',
    requestManualVerificationOfPayments: 'Request manual verification of payments',
    completePaymentHistory: 'Complete payment history',
    verificationByAdministrator: 'Verification by administrator',
    responseInLessThan2Hours: 'Response in less than 2 hours',
    transactionHistory: 'Transaction History',
    viewVerifyAndManageYourPayments: 'View, verify and manage your payments',
    supportedCryptocurrencies: 'Supported Cryptocurrencies',
    payWithAnyOfTheseCoinsAndMore: 'Pay with any of these coins and more',
    bitcoin: 'Bitcoin',
    ethereum: 'Ethereum',
    usdt: 'USDT',
    usdc: 'USDC',
    bnb: 'BNB',
    solana: 'Solana',
    litecoin: 'Litecoin',
    more50Plus: '50+ More',
    howItWorks: 'How It Works',
    chooseYourPaymentMethod: 'Choose Your Payment Method',
    selectBetweenMultiCryptoOrDirectUSDT: 'Select between multi-crypto or direct USDT',
    enterTheAmount: 'Enter the Amount',
    specifyHowMuchUSDTYouWantToInvest: 'Specify how much USDT you want to invest',
    makeThePayment: 'Make the Payment',
    sendTheExactAmountToTheProvidedAddress: 'Send the exact amount to the provided address',
    receiveYourMXI: 'Receive Your MXI',
    tokensWillBeCreditedAutomatically: 'Tokens will be credited automatically',
    advantagesOfOurPaymentSystem: 'Advantages of Our Payment System',
    automaticConfirmationInMinutes: 'Automatic confirmation in minutes',
    secureAndVerifiedOnBlockchain: 'Secure and verified on blockchain',
    multiplePaymentOptionsAvailable: 'Multiple payment options available',
    available247WithoutIntermediaries: 'Available 24/7 without intermediaries',
    paymentMethods: 'Payment Methods',
    cryptocurrencies: 'Cryptocurrencies',
    available247: 'Available 24/7',
    
    // USDT Payment (pagar-usdt.tsx)
    payInUSDT: 'Pay in USDT',
    selectPaymentNetwork: 'Select Payment Network',
    eachNetworkValidatesIndependently: 'Each network validates independently',
    networkDescription: 'Payments on {{network}}',
    validationIn: 'Validation in {{network}}',
    paymentsOnlyValidatedOnNetwork: 'Payments are only validated on {{network}}',
    paymentInstructions: 'Payment Instructions',
    selectNetworkYouWillUse: 'Select the network you will use ({{label}})',
    sendUSDTFromAnyWallet: 'Send USDT from any wallet',
    minimumAmountLabel: 'Minimum amount: {{min}} USDT',
    copyTransactionHash: 'Copy the transaction hash',
    pasteHashAndVerify: 'Paste the hash and verify',
    youWillReceiveMXI: 'You will receive MXI at a rate of {{rate}}:1',
    recipientAddress: 'Recipient Address ({{label}})',
    addressCopiedToClipboard: 'copied to clipboard',
    onlySendUSDTOnNetwork: 'Only send USDT on {{network}} ({{label}})',
    mxiCalculator: 'MXI Calculator',
    transactionHashTxHash: 'Transaction Hash (TxHash)',
    pasteYourTransactionHash: 'Paste your transaction hash from {{network}}',
    correctLength: '✅ Correct length (66 characters)',
    charactersCount: '{{count}} characters',
    verifyAutomatically: 'Verify Automatically',
    requestManualVerificationButton: 'Request Manual Verification',
    sendingRequestText: 'Sending request...',
    importantValidationByNetwork: 'Important: Validation by Network',
    eachNetworkValidatesIndependentlyInfo: 'Each network validates independently',
    paymentsOnETHOnlyValidatedOnETH: 'Payments on Ethereum are only validated on Ethereum',
    paymentsOnBNBOnlyValidatedOnBNB: 'Payments on BNB Chain are only validated on BNB Chain',
    paymentsOnPolygonOnlyValidatedOnPolygon: 'Payments on Polygon are only validated on Polygon',
    ensureCorrectNetworkBeforeVerifying: 'Ensure you select the correct network before verifying',
    transactionMustHave3Confirmations: 'Transaction must have at least 3 confirmations',
    cannotUseSameHashTwice: 'Cannot use the same hash twice',
    ifAutomaticFailsUseManual: 'If automatic verification fails, use manual verification',
    
    // USDT Payment - Verification Errors
    pleaseEnterTransactionHash: 'Please enter the transaction hash',
    invalidHash: 'Invalid Hash',
    hashMustStartWith0x: 'Hash must start with 0x and be 66 characters long (current: {{count}})',
    confirmNetworkTitle: 'Confirm Network',
    areYouSureTransaction: 'Are you sure the transaction was made on {{network}} ({{label}})?',
    yesVerifyButton: 'Yes, Verify',
    verifying: 'Verifying...',
    hashDuplicateTitle: 'Duplicate Hash',
    hashAlreadyRegisteredText: 'This hash is already registered in order {{order}} with status: {{status}}',
    databaseErrorText: 'Database error: {{message}}',
    transactionNotFound: 'Transaction Not Found',
    transactionNotFoundText: 'Transaction not found on {{network}}. Please verify the hash and network.',
    waitingConfirmations: 'Waiting for Confirmations',
    waitingConfirmationsText: '{{message}} ({{confirmations}}/{{required}} confirmations)',
    insufficientAmountTitle: 'Insufficient Amount',
    insufficientAmountText: 'Minimum amount is {{min}} USDT. {{message}} ({{usdt}} USDT, minimum: {{minimum}} USDT)',
    alreadyProcessed: 'Already Processed',
    alreadyProcessedText: 'This transaction has already been processed',
    invalidTransfer: 'Invalid Transfer',
    invalidTransferText: 'No valid USDT transfer found to address {{address}} on {{network}}',
    transactionFailed: 'Transaction Failed',
    transactionFailedText: 'The transaction failed on the blockchain',
    invalidNetworkTitle: 'Invalid Network',
    invalidNetworkText: 'The selected network is not valid',
    configurationError: 'Configuration Error',
    configurationErrorText: 'RPC configuration error: {{message}}',
    incorrectNetwork: 'Incorrect Network',
    incorrectNetworkText: 'The transaction was not made on the selected network',
    authenticationError: 'Authentication Error',
    incompleteData: 'Incomplete Data',
    incompleteDataText: 'Required data is missing',
    databaseError: 'Database Error',
    rpcConnectionError: 'RPC Connection Error',
    rpcConnectionErrorText: 'Could not connect to blockchain: {{message}}',
    internalError: 'Internal Error',
    internalErrorText: 'Internal server error: {{message}}',
    unknownError: 'Unknown Error',
    unknownErrorText: 'An unknown error occurred',
    connectionError: 'Connection Error',
    connectionErrorText: 'Connection error: {{message}}',
    paymentConfirmedTitle: 'Payment Confirmed!',
    paymentConfirmedText: '✅ {{amount}} MXI credited successfully!\n\nNetwork: {{network}}\nAmount: {{usdt}} USDT',
    viewBalance: 'View Balance',
    verificationError: 'Verification Error',
    
    // Manual Verification Request
    requestManualVerificationTitle: 'Request Manual Verification',
    doYouWantToSendManualRequest: 'Do you want to send a manual verification request for this transaction?\n\nNetwork: {{network}} ({{label}})\nHash: {{hash}}',
    requestSentSuccessfullyTitle: 'Request Sent Successfully',
    manualVerificationRequestSentText: 'Manual verification request sent successfully!\n\nOrder: {{order}}\nNetwork: {{network}}\nHash: {{hash}}\n\nAn administrator will review your payment within 24-48 hours.',
    viewTransactions: 'View Transactions',
    errorSendingRequestTitle: 'Error Sending Request',
    couldNotSendVerificationRequestText: 'Could not send verification request: {{error}} (Code: {{code}})',
    
    // Manual Verification Screen
    manualVerification: 'Manual Verification',
    nowPayments: 'NowPayments',
    directUSDT: 'Direct USDT',
    verificationOfNowPayments: 'Verification of NowPayments',
    viewHistoryAndRequestManualVerification: 'View your payment history and request manual verification if needed',
    noNowPaymentsRegistered: 'No NowPayments registered yet',
    verificationOfUSDT: 'Verification of USDT',
    requestManualVerificationOfUSDT: 'Request manual verification of your USDT payments',
    requestManualUSDTVerification: 'Request Manual USDT Verification',
    doYouWantToRequestManualVerification: 'Do you want to request manual verification for this transaction?\n\nNetwork: {{network}} ({{label}})\nHash: {{hash}}',
    usdtPaymentHistory: 'USDT Payment History',
    noUSDTPaymentsRegistered: 'No USDT payments registered yet',
    manualVerificationRequested: 'Manual verification requested',
    administratorReviewingPayment: 'Administrator is reviewing your payment',
    administratorRequestsMoreInfo: 'Administrator Requests More Information',
    informationRequested: 'Information Requested:',
    responseSent: 'Response Sent',
    manualVerificationApproved: 'Manual verification approved',
    rejectedReason: 'Rejected: {{reason}}',
    noReason: 'No reason provided',
    paymentCreditedSuccessfully: 'Payment credited successfully',
    existingRequest: 'Existing Request',
    existingRequestMessage: 'A verification request already exists for this payment with status: {{status}}',
    requestManualVerificationNowPayments: 'Request Manual Verification',
    doYouWantToRequestNowPaymentsVerification: 'Do you want to request manual verification for this payment?\n\nAmount: {{amount}} USDT\nMXI: {{mxi}}\nOrder: {{order}}',
    requestSentMessage: 'Manual verification request sent successfully. An administrator will review it soon.',
    respondToAdministrator: 'Respond to Administrator',
    yourResponse: 'Your Response',
    writeYourResponseHere: 'Write your response here...',
    responseSentToAdministrator: 'Response sent to administrator successfully',
    errorSendingResponse: 'Error sending response',
    
    // Payment Status
    completed: 'Completed',
    confirmed: 'Confirmed',
    waitingForPayment: 'Waiting for Payment',
    confirming: 'Confirming',
    failed: 'Failed',
    expired: 'Expired',
    couldNotLoadVestingInfo: 'Could not load information',
    
    // Transaction History
    transactionHistoryTitle: 'Transaction History',
    pendingTransactions: 'Pending',
    successfulTransactions: 'Successful',
    failedTransactions: 'Failed',
    purchaseMXINowPayments: 'Purchase MXI (NowPayments)',
    purchaseMXIOKX: 'Purchase MXI (OKX)',
    manualPayment: 'Manual Payment',
    commission: 'Commission',
    allTransactions: 'All',
    couldNotLoadTransactionHistory: 'Could not load transaction history',
    couldNotOpenPaymentLink: 'Could not open payment link',
    cancelTransaction: 'Cancel Transaction',
    areYouSureCancelTransaction: 'Are you sure you want to cancel this transaction?',
    noCancelIt: 'No, keep it',
    yesCancelIt: 'Yes, cancel it',
    cancelledByUser: 'Cancelled by user',
    cancelled: 'Cancelled',
    transactionCancelled: 'Transaction cancelled successfully',
    couldNotCancelTransaction: 'Could not cancel transaction',
    noPaymentID: 'No Payment ID',
    paymentCreationFailed: 'Payment creation failed. Would you like to cancel this transaction?',
    sessionExpired: 'Session expired. Please log in again.',
    errorVerifying: 'Error Verifying',
    couldNotVerifyPaymentStatus: 'Could not verify payment status',
    errorDetails: 'Error Details',
    details: 'Details',
    unknownError: 'Unknown error',
    noDetailsAvailable: 'No details available',
    paymentConfirmed: 'Payment Confirmed',
    paymentConfirmedBalanceUpdated: 'Your payment has been confirmed and your balance has been updated!',
    paymentFailed: 'Payment Failed',
    paymentFailedOrExpired: 'Your payment has {status}. Please try again.',
    paymentStatus: 'Payment Status',
    currentStatus: 'Current status: {status}',
    couldNotVerifyStatus: 'Could not verify status',
    networkError: 'Network Error',
    couldNotConnectToServer: 'Could not connect to server. Please check your internet connection.',
    loadingHistory: 'Loading history...',
    noTransactions: 'No Transactions',
    noTransactionsYet: 'You have no transactions yet',
    noPendingTransactions: 'No pending transactions',
    noSuccessfulTransactions: 'No successful transactions',
    noFailedTransactions: 'No failed transactions',
    pay: 'Pay',
    verify: 'Verify',
    viewTechnicalDetails: 'View Technical Details',
    
    // Withdrawals (Retiros) Page
    withdraw: 'Withdraw',
    retiros: 'Withdrawals',
    loadingData: 'Loading data...',
    mxiAvailable: 'MXI Available',
    totalMXI: 'Total MXI',
    approximateUSDT: 'Approximate USDT',
    withdrawalType: 'Withdrawal Type',
    withdrawMXIPurchased: 'Withdraw Purchased MXI',
    mxiAcquiredThroughPurchases: 'MXI acquired through purchases',
    lockedUntilLaunch: 'Locked until launch',
    withdrawMXICommissions: 'Withdraw Commission MXI',
    mxiFromReferralCommissions: 'MXI from referral commissions',
    available: 'Available',
    availableLabel: 'Available',
    withdrawMXIVesting: 'Withdraw Vesting MXI',
    mxiGeneratedByYield: 'MXI generated by yield',
    realTime: 'Real-time',
    activeReferralsForVestingWithdrawals: '7 Active Referrals for vesting withdrawals ({{count}}/7)',
    withdrawMXITournaments: 'Withdraw Tournament MXI',
    mxiWonInTournamentsAndChallenges: 'MXI won in tournaments and challenges',
    withdrawalDetails: 'Withdrawal Details',
    withdrawalsInUSDT: 'Withdrawals are processed in USDT',
    withdrawalsInUSDTETH: 'Withdrawals in USDT (Ethereum Network)',
    amountMXI: 'Amount (MXI)',
    amountInMXI: 'Amount in MXI',
    maximum: 'Max',
    equivalentInUSDT: 'Equivalent in USDT',
    rate: 'Rate',
    walletAddressETH: 'Wallet Address (ETH)',
    enterYourETHWalletAddress: 'Enter your ETH wallet address',
    requestWithdrawal: 'Request Withdrawal',
    withdrawalRequirements: 'Withdrawal Requirements',
    activeReferralsForGeneralWithdrawals2: '5 Active Referrals for general withdrawals ({{count}}/5)',
    mxiLaunchRequiredForPurchasedAndVesting: 'MXI Launch required for Purchased and Vesting withdrawals',
    importantInformation: 'Important Information',
    withdrawalsInUSDTETHInfo: 'Withdrawals are processed in USDT on the Ethereum network',
    conversionInfo: 'Conversion rate: 1 MXI = 0.4 USDT',
    mxiCommissionsInfo: 'Commission MXI is available immediately with 5 active referrals + KYC',
    mxiTournamentsInfo: 'Tournament MXI is available with the same requirements as commissions',
    mxiVestingInfo: 'Vesting MXI requires 7 active referrals and MXI launch',
    mxiPurchasedInfo: 'Purchased MXI is locked until the official MXI launch',
    mxiCommissionsAvailableImmediately: 'Commission MXI is available immediately with 5 active referrals + KYC',
    mxiTournamentsAvailableSameAsCommissions: 'Tournament MXI is available with the same requirements as commissions',
    mxiVestingRequires7Referrals: 'Vesting MXI requires 7 active referrals and MXI launch',
    mxiPurchasedLockedUntilLaunch: 'Purchased MXI is locked until the official MXI launch',
    realTimeUpdateInfo: 'Vesting balance updates in real-time every second',
    processingTime: 'Processing Time',
    processingTimeInfo: 'Withdrawals are processed within 24-48 hours',
    verifyWalletAddress: 'Verify Wallet Address',
    verifyWalletAddressInfo: 'Verify your wallet address carefully before submitting',
    viewWithdrawalHistory2: 'View Withdrawal History',
    invalidAmount: 'Invalid Amount',
    enterValidAmount: 'Please enter a valid amount',
    missingInformation: 'Missing Information',
    enterWalletAddress: 'Please enter your wallet address',
    insufficientBalanceNeed: 'You need {{needed}} MXI but only have {{available}} MXI available',
    withdrawalNotAvailable: 'Withdrawal Not Available',
    withdrawalsAvailableAfterLaunch: '{{label}} withdrawals will be available after MXI launch ({{days}} days remaining)',
    requirementNotMet: 'Requirement Not Met',
    vestingRequires7Referrals: 'Vesting withdrawals require 7 active referrals. You currently have {{count}}.',
    understood: 'Understood',
    notEligible: 'Not Eligible',
    need5ActiveReferralsAndKYC: 'You need 5 active referrals and approved KYC to withdraw commissions and tournaments',
    confirmWithdrawal: 'Confirm Withdrawal',
    confirmWithdrawalMessage: 'Are you sure you want to withdraw {{mxi}} MXI ({{label}})?\n\nYou will receive approximately {{usdt}} USDT',
    requestSent: 'Request Sent',
    withdrawalRequestSent: 'Withdrawal request sent successfully!\n\n{{mxi}} MXI ({{label}}) → {{usdt}} USDT\n\nAn administrator will process your withdrawal within 24-48 hours.',
    errorProcessingWithdrawal: 'Error processing withdrawal. Please try again.',
    mxiPurchasedText: 'Purchased MXI',
    mxiCommissionsText: 'Commission MXI',
    mxiVestingText: 'Vesting MXI',
    mxiTournamentsText: 'Tournament MXI',
    
    // Withdrawal History
    withdrawalHistoryTitle: 'Withdrawal History',
    noWithdrawalsYet: 'No withdrawals yet',
    withdrawalHistoryWillAppear: 'Your withdrawal history will appear here',
    walletAddressText: 'Wallet Address',
    completedText: 'Completed',
    processing: 'Processing',
    
    // Tournaments Page
    tournamentsTitle: 'Tournaments',
    availableGames: 'Available Games',
    distributionOfRewards: 'Distribution of Rewards',
    winner: 'Winner',
    prizeFund: 'Prize Fund',
    onlyUseCommissionsOrChallenges: 'Only use MXI from Commissions or Challenges to participate in tournaments',
    waitingTournaments: 'Waiting Tournaments',
    code: 'Code',
    players: 'Players',
    prize: 'Prize',
    full: 'Full',
    createNewTournament: 'Create New Tournament',
    tournamentLimitReached: 'Tournament Limit Reached',
    maxTournamentsReached: 'Maximum number of open tournaments reached for this game',
    joinTournament: 'Join Tournament',
    entryFee: 'Entry Fee',
    join: 'Join',
    create: 'Create',
    joiningGame: 'Joining game...',
    creatingTournament: 'Creating tournament...',
    selectPlayers: 'Select Players',
    asFirstPlayerChoosePlayers: 'As the first player, choose how many players will participate in this tournament',
    createTournamentOf: 'Tournament of {{count}} Players',
    participateFor: 'Participate for {{fee}} MXI',
    
    // Game Lobby
    invalidSession: 'Invalid session',
    sessionCancelled: 'Session Cancelled',
    sessionWasCancelled: 'The session was cancelled',
    removedFromSession: 'Removed from Session',
    youWereRemovedFromSession: 'You were removed from the session',
    waitingForPlayers: 'Waiting for Players',
    leavingGameWarning: 'Leave Game?',
    leavingGameWarningMessage: 'Are you sure you want to leave? Your entry fee will be refunded.',
    
    // Risks Tab Content - NEW CONTENT
    risksIntro: 'Investing in MXI represents an innovative opportunity within an ecosystem designed for real growth, but it also involves harmful risks that every investor must consider responsibly. MXI promotes transparency, so we detail the key factors that can influence the present and future profitability of the project.',
    risk1Title: '1. Market Volatility Risk',
    risk1Description: 'The crypto market is highly volatile. Although MXI integrates a hybrid tokenomic model that seeks stability through daily vesting, liquidity mechanisms and scalable rewards, the price can fluctuate significantly due to global conditions, market sentiment or unexpected events. The projected launch value (3 USDT) is an estimate, not a guarantee.',
    risk2Title: '2. Technological Risk',
    risk2Description: 'Despite MXI incorporating post-quantum quantum security and advanced architecture, no digital ecosystem is completely free of vulnerabilities. Protocol failures, external attacks or new technological threats could affect operability. Quantum implementation minimizes future scenarios, but does not eliminate risks 100%.',
    risk3Title: '3. Project Execution Risk',
    risk3Description: 'MXI is in the prevention phase and, like any project in development, depends on the correct execution of the technical plan, implementation times, community adoption and consolidation of strategic alliances. Delays or restructuring can impact goals and projections.',
    risk4Title: '4. Regulatory Risk',
    risk4Description: 'The global regulatory environment regarding crypto assets is changing. Changes in laws of key countries, greater compliance requirements or restrictions on exchanges can influence the liquidity, accessibility or price of the token.',
    risk5Title: '5. Liquidity Risk',
    risk5Description: 'Although MXI integrates a progressive liquidity model and tools that encourage holding (daily vesting, rewards, referrals), in initial stages liquidity may be limited. This could make immediate sales at the desired price difficult.',
    risk6Title: '6. Ecosystem Adoption Risk',
    risk6Description: 'The potential of MXI grows as the community strengthens and use within the ecosystem increases (card, credits, tools for entrepreneurs, Marketplaces, Launchpad, energy, global expansion, etc.). Slower adoption could prolong token appreciation times.',
    risk7Title: '7. Competitive Risk',
    risk7Description: 'MXI competes in a market where highly positioned projects exist (BTC, ETH, SOL, ADA). Although the hybrid model, dynamic vesting and quantum security represent differential advantages, competitor advances could affect potential market share.',
    risk8Title: '8. Community Dependence Risk',
    risk8Description: 'MXI is based on a fundamental principle: if the community grows, everyone grows. This means that part of the success depends on the participation, commitment and expansion of users, project issuers, entrepreneurs and investors. Low participation would limit global projections.',
    risk9Title: '9. Early Investment Risk',
    risk9Description: 'As in all prevention, investors acquire the token before the ecosystem is fully deployed. Although this offers price advantages (0.04 / 0.07 / 0.10 USDT), it also carries the natural uncertainty of the initial stages.',
    
    // Additional translations for untranslated pages
    ambassadorButtonTitle: 'MXI Ambassadors',
    ambassadorButtonSubtitle: 'Earn bonuses for your referrals',
    vestingAndPerformance: 'Vesting and Performance',
    performanceProjected: 'Projected Performance',
    phaseInfo: 'Phase {{phase}} • 1 MXI = ${{price}} USDT',
    perHour: 'Per Hour',
    per7Days: 'Per 7 Days',
    per1Month: 'Per 1 Month (30 days)',
    untilLaunch: 'Until Launch',
    daysRemaining: '{{days}} days remaining',
    monthlyMaximum: 'Monthly Maximum (3%)',
    basedOnPurchased: 'Based on {{amount}} MXI purchased',
    balanceBlocked: 'Balance Blocked',
    vestingCannotBeWithdrawn: 'Vesting balance cannot be withdrawn until the coin is officially launched.',
    monthlyYield: 'Monthly Yield',
    calculationBase: 'Calculation Base',
    onlyPurchasedMXI: 'Only Purchased MXI',
    update: 'Update',
    everySecond: 'Every Second',
    currentPhaseLabel: 'Current Phase',
    mxiPrice: 'MXI Price',
    separateBalances: 'Separate Balances (Do not generate vesting)',
    doesNotGenerateVesting: 'Does not generate vesting yield',
    monthlyProgress: 'Monthly Progress (3% max.)',
    nearMonthlyLimit: 'Near monthly limit of 3%',
    accumulatedTotalYield: 'Accumulated Total Yield',
    generatingPerSecondValue: 'Generating {{rate}} MXI per second',
    previousAccumulated: 'Previous Accumulated',
    noMXIInVesting: 'No MXI in vesting. Only directly purchased MXI generates vesting yield.',
    miningRate: 'Mining rate: 0.005% per hour of your purchased MXI. Only directly purchased MXI generates vesting yield. Commissions DO NOT generate vesting. To claim your mined MXI, you need 5 active referrals, 10 days of membership and KYC approval. Remember that for vesting you must have 10 active referrals and it will be unlocked once the token is launched and listed on exchanges.',
    shareReferralCodeMessage: 'Join the MXI Pool with my referral code: {{code}}\n\nEarn MXI tokens and get rewards!',
    copiedToClipboard: 'Referral code copied to clipboard',
    yourReferrals: 'Your Referrals',
    totalEarned: 'Total Earned',
    allCommissionsInMXI: 'All commissions are handled internally in MXI',
    withdrawToMXIBalance: 'Withdraw to MXI Balance',
    transferCommissionsToMainBalance: 'Transfer your commissions to your main MXI balance to use them for purchases and other functions.',
    withdrawToBalance: 'Withdraw to Balance',
    amountToWithdraw: 'Amount to Withdraw (MXI)',
    minimum50MXI: 'Minimum 50 MXI',
    availableAmount: 'Available: {{amount}} MXI',
    requirements: 'Requirements:',
    activeReferrals5: '5 active referrals ({{count}}/5)',
    minimum50MXIRequired: 'Minimum 50 MXI',
    shareYourReferralCode: 'Share your referral code with friends',
    howReferralsWork: 'How Referrals Work',
    earn5PercentMXILevel1: 'Earn 5% in MXI from Level 1 referrals',
    earn2PercentMXILevel2: 'Earn 2% in MXI from Level 2 referrals',
    earn1PercentMXILevel3: 'Earn 1% in MXI from Level 3 referrals',
    activeReferralsNote: '* Active referrals are those who have made at least one purchase of 50 USDT or more',
    invalidAmount: 'Invalid Amount',
    pleaseEnterValidAmount: 'Please enter a valid amount',
    insufficientBalanceOnly: 'You only have {{available}} MXI available from commissions',
    requirementsNotMetTitle: 'Requirements Not Met',
    need5ActiveReferralsMessage: 'You need 5 active referrals who have purchased the minimum MXI.\n\nYou currently have: {{count}} active referrals',
    confirmWithdrawToBalance: 'Confirm Withdrawal to MXI Balance',
    confirmWithdrawToBalanceMessage: 'Do you want to transfer {{amount}} MXI from commissions to your main balance?\n\nThis will allow you to use this MXI for purchases and other functions.',
    withdrawalSuccessful: 'Withdrawal Successful',
    transferredToMainBalance: '{{amount}} MXI has been transferred to your main balance',
    failedToCompleteWithdrawal: 'Failed to complete withdrawal',
    unexpectedError: 'An unexpected error occurred',
    networkTRC20: 'Withdrawals will be processed in USDT via TRC20 network (Tron)',
    walletAddressTRC20: 'USDT Wallet Address (TRC20)',
    enterTRC20WalletAddress: 'Enter your USDT TRC20 wallet address (Tron)',
    activeReferrals7Required: '7 Active Referrals required ({{count}}/7)',
    activeReferralsGeneral5: '5 Active Referrals for general withdrawals ({{count}}/5)',
    activeReferralsVesting7: '7 Active Referrals for vesting withdrawals ({{count}}/7)',
    vestingGenerates3Percent: 'Vesting generates 3% monthly only on directly purchased MXI',
    verifyWalletAddressCarefully: 'Verify that your wallet address is correct and compatible with TRC20 network (Tron)',
    loadingAmbassadorData: 'Loading ambassador data...',
    thisMayTakeFewSeconds: 'This may take a few seconds',
    couldNotLoadInformation: 'Could not load information',
    pleaseTryAgain: 'Please try again',
    retry: 'Retry',
    goBack: 'Go Back',
    yourCurrentLevelTitle: 'Your Current Level',
    levelRequirement: 'Requirement: {{amount}} USDT',
    notAchievedAnyLevel: 'You have not achieved any level yet',
    needValidPurchases: 'You need {{amount}} USDT in valid purchases from Level 1 referrals',
    validPurchasesAccumulated: 'Valid Purchases Accumulated',
    progressToNextLevelTitle: 'Progress to Next Level',
    nextLevel: 'Next Level',
    withdrawn: 'Withdrawn',
    requirementsMustBeMet: 'Level must be fully achieved',
    mustHaveKYCApproved: 'Must have approved KYC',
    mustHavePersonalPurchase: 'Must have minimum 1 personal purchase',
    withdrawalMethodTRC20: 'Withdrawal method: USDT TRC20 only',
    bonusesAdditionalToCommission: 'Bonuses are additional to the 5% referral commission',
    allBonusesCumulative: 'All bonuses are cumulative',
    onlyLevel1Purchases: 'Only Level 1 referral purchases count',
    minimumPerPurchase: 'Minimum amount per purchase: 50 USDT',
    onlyPresalePurchases: 'Only presale purchases paid in USDT',
    adminWillProcess: 'Administrator will process your withdrawal in 24-48 hours',
    updatedAt: 'Updated: {{time}}',
    showingCachedData: 'Showing cached data, updating...',
    showingCachedDataError: 'Showing cached data (error updating)',
    showingCachedDataOnly: 'Showing cached data',
    loadingFundraisingData: 'Loading fundraising data...',
    updated: 'Updated',
    totalRaised: 'Total Raised',
    mxiBreakdown: 'MXI Breakdown',
    purchases: 'Purchases',
    challenges: 'Challenges',
    totalFundraisingProject: 'Total Project Fundraising',
    presaleProgress: 'Presale progress MXI',
    presaleStartDate: 'Presale Start',
    presaleEndDate: 'Presale End',
    fundraisingBreakdown: 'Fundraising Breakdown',
    purchasedMXI: 'Purchased MXI',
    totalMXISold: 'Total MXI sold (includes user payments and manual sales)',
    transactions: 'transactions',
    transaction: 'transaction',
    generalProgressLabel: 'General Progress',
    mxiDistributionBreakdown: 'MXI Distribution Breakdown',
    directPurchases: 'Direct Purchases',
    mxiAcquiredViaUSDT: 'MXI acquired through USDT payments. Users receive MXI according to current phase price.',
    ofTotal: 'of total',
    referralCommissions: 'Referral Commissions',
    mxiGeneratedByReferrals: 'MXI generated by referral system (3% level 1, 2% level 2, 1% level 3). Calculated automatically when referrals make purchases.',
    challengesAndTournaments: 'Challenges and Tournaments',
    mxiWonInTournamentsDesc: 'MXI won in tournaments and challenges. Requires 5 active referrals to withdraw.',
    vestingLocked: 'Vesting (Locked)',
    mxiGeneratedByVestingSystem: 'MXI generated by vesting/yield system. Locked until official MXI launch date.',
    commissionsAndPrizesGenerated: 'Commissions, prizes and vesting are generated as additional incentives from the MXI ecosystem.',
    thisMetricShowsProgress: 'This metric shows the total fundraising progress of the MXI project. Includes all confirmed MXI purchases. The maximum goal is 17,500,000 USDT for the complete ecosystem development (3 presale phases).',
    lastUpdate: 'Last update: {{time}} (Refresh #{{count}})',
    fundraisingMilestones: 'Fundraising Milestones',
    phase1Milestone: 'Phase 1 - 3.33M USDT (0.40 USDT/MXI)',
    phase2Milestone: 'Phase 2 - 9.17M USDT (0.70 USDT/MXI)',
    phase3Milestone: 'Phase 3 - 17.5M USDT (1.00 USDT/MXI)',
    backToHome: 'Back to Home',
    adminDashboard: 'Admin Dashboard',
    welcomeAdmin: 'Welcome, {{name}}',
    dangerZone: 'DANGER ZONE',
    dangerZoneDescription: 'Reset all MXI counters to 0 (INCLUDING ADMIN). Referral relationships will be preserved. This action is IRREVERSIBLE.',
    resetAll: 'Reset All',
    presaleMetrics: 'Presale Metrics',
    totalSold: 'Total Sold',
    totalMembers: 'Total Members',
    progress: 'Progress',
    users: 'Users',
    active: 'Active',
    totalUSDT: 'Total USDT',
    totalMXI: 'Total MXI',
    quickActions: 'Quick Actions',
    manualVerifications: 'Manual Verifications',
    advancedManagement: 'Advanced Management',
    creditManualPayment: 'Credit Manual Payment',
    approveKYC: 'Approve KYC',
    withdrawals: 'Withdrawals',
    supportMessages: 'Support Messages',
    basicUsers: 'Basic Users',
    vestingAnalytics: 'Vesting Analytics',
    deleteAccounts: 'Delete Accounts',
    ambassadorBonuses: 'Ambassador Bonuses',
    resetSystemTitle: 'Reset Entire System?',
    resetSystemMessage: 'This action is IRREVERSIBLE and will reset all counters to 0 (INCLUDING ADMIN):',
    allBalancesReset: 'All MXI and USDT balances will be set to 0 (including admin)',
    allCommissionsDeleted: 'All commissions will be deleted',
    allContributionsDeleted: 'All contributions will be deleted',
    allWithdrawalsDeleted: 'All withdrawals will be deleted',
    allPaymentsDeleted: 'All payments and orders will be deleted',
    presaleMetricsReset: 'Presale metrics will be reset to 0',
    allVestingDeleted: 'All vesting will be deleted',
    adminBalanceReset: 'Admin balance will also be reset to 0',
    referralRelationsPreserved: 'Referral relationships WILL BE PRESERVED',
    typeResetToConfirm: 'Type "RESET" to confirm:',
    confirmReset: 'Confirm Reset',
    mustTypeReset: 'You must type "RESET" to confirm',
    systemReset: 'System Reset',
    systemResetSuccess: 'The page will reload to update the data.',
    updateComplete: 'Update Complete',
    allDataUpdated: 'All data has been updated. Admin balance is now 0.',
    resetError: 'Error resetting system',
    accessDenied: 'Access Denied',
    noAdminPermissions: 'You do not have administrator permissions',
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
    share: 'Compartilhar',
    copy: 'Copiar',
    copied: '¡Copiado!',
    copied2: '✅ Copiado',
    or: 'o',
    and: 'y',
    total: 'Total',
    continue: 'Continuar',
    send: 'Enviar',
    request: 'Solicitar',
    sendRequest: 'Enviar Solicitud',
    respond: 'Responder',
    pending: 'Pendiente',
    selectLanguage: 'Seleccionar Idioma',
    date: 'Fecha',
    currency: 'Moneda',
    network: 'Red',
    order: 'Orden',
    paymentID: 'ID de Pago',
    transactionHash: 'Hash de Transacción',
    
    // Tab Navigation
    tabHome: 'Inicio',
    tabDeposit: 'Depósito',
    tabWithdraw: 'Retirar',
    tabReferrals: 'Referidos',
    tabTournaments: 'Torneos',
    tabRewards: 'Recompensas',
    tabEcosystem: 'Ecosistema',
    tabProfile: 'Perfil',
    
    // Auth - Login Screen
    login: 'Iniciar Sesión',
    loginButton: 'Iniciar Sesión',
    register: 'Registrarse',
    logout: 'Cerrar Sesión',
    email: 'Correo Electrónico',
    emailLabel: 'Correo Electrónico',
    password: 'Contraseña',
    passwordLabel: 'Contraseña',
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
    fillAllFields: 'Por favor completa todos los campos',
    emailVerificationRequired: 'Verificación de Email Requerida',
    pleaseVerifyEmail: 'Por favor verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada para el enlace de verificación.',
    resendEmail: 'Reenviar Email',
    loginError: 'Error de Inicio de Sesión',
    invalidCredentials: 'Email o contraseña inválidos. Por favor intenta de nuevo.',
    errorLoggingIn: 'Error al iniciar sesión. Por favor intenta de nuevo.',
    emailVerificationSent: '¡Email de verificación enviado! Por favor revisa tu bandeja de entrada.',
    errorResendingEmail: 'Error al reenviar email de verificación. Por favor intenta de nuevo.',
    recoverPasswordTitle: 'Recuperar Contraseña',
    recoverPasswordMessage: 'Para recuperar tu contraseña, por favor contacta a nuestro equipo de soporte.',
    contactSupport: 'Contactar Soporte',
    support: 'Soporte',
    sendEmailTo: 'Envía un email a:',
    supportEmail: 'soporte@maxcoin.com',
    mxiStrategicPresale: 'Preventa Estratégica MXI',
    secureYourPosition: 'Asegura tu posición en el futuro',
    viewTerms: 'Ver Términos y Condiciones',
    termsAndConditions: 'Términos y Condiciones',
    presaleClosesOn: 'La preventa cierra el 15 de febrero de 2026 a las 12:00 UTC',
    pleaseVerifyEmailBeforeLogin: 'Por favor verifica tu email antes de iniciar sesión',
    resendEmailButton: 'Reenviar Email',
    
    // Register Screen
    joinMXIStrategicPresale: 'Únete a la Preventa Estratégica MXI',
    fullName: 'Nombre Completo',
    enterYourFullName: 'Ingresa tu nombre completo',
    enterYourIDNumber: 'Ingresa tu número de identificación',
    enterYourResidentialAddress: 'Ingresa tu dirección de residencia',
    minimumSixCharacters: 'Mínimo 6 caracteres',
    reEnterPassword: 'Vuelve a ingresar tu contraseña',
    enterReferralCode: 'Ingresa código de referido (opcional)',
    onlyOneAccountPerPerson: 'Solo una cuenta por persona. Las cuentas múltiples serán suspensas.',
    iHaveReadAndAccept: 'He leído y acepto los',
    alreadyHaveAccountLogin: '¿Ya tienes una cuenta?',
    acceptTermsButton: 'Aceptar Términos',
    termsAndConditionsRequired: 'Términos y Condiciones Requeridos',
    youMustAcceptTerms: 'Debes aceptar los Términos y Condiciones para continuar',
    passwordsDontMatch: 'Las contraseñas no coinciden',
    passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
    invalidEmail: 'Por favor ingresa un correo electrónico válido',
    accountCreatedSuccessfully: '✅ ¡Cuenta creada exitosamente! Por favor verifica tu email antes de iniciar sesión.',
    failedToCreateAccount: 'Error al crear la cuenta. Por favor intenta de nuevo.',
    termsContent: `TÉRMINOS Y CONDICIONES DE USO

MXI STRATEGIC PRESALE – APP VERSION

MAXCOIN (MXI) es una marca registrada de MXI Strategic Holdings Ltd., Islas Caimán.
App operada por MXI Technologies Inc. (Panamá).
Última actualización: 15/01/2026 – Versión 1.1

1. Aceptación

Al crear una cuenta o utilizar la aplicación MXI Strategic Presale (la "App"), usted acepta estos Términos y Condiciones.
Si no está de acuerdo con ellos, no debe usar la App.

2. Sobre MXI

MXI Strategic Holdings Ltd. (Caimán) es la entidad propietaria del token MXI, la marca y la propiedad intelectual.

MXI Technologies Inc. (Panamá) es la empresa operadora de la App y responsable de su funcionamiento.

3. Función de la App

La App permite:

- Registrar usuarios
- Comprar tokens MXI con USDT (vía CRIPTOMONEDA)
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
- Pago exclusivamente en USDT a través de CRIPTOMONEDA
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
**Versión**: 1.1`,
    privacyPolicy: 'Política de Privacidad',
    viewPrivacyPolicy: 'Ver Política de Privacidad',
    privacyPolicyContent: `POLÍTICA DE PRIVACIDAD

La presente Política de Privacidad describe cómo MXI Technologies Inc. ("MXI", "nosotros") recopila, utiliza y protege los datos personales de los usuarios que utilizan la App MXI Strategic Presale ("la App"). Al registrarse o usar la App, usted acepta esta Política.

1. Datos que recopilamos

Recopilamos la información necesaria para el funcionamiento seguro de la App, incluyendo:

- Nombre completo
- Documento de identidad
- Fecha de nacimiento
- Correo electrónico
- Número de teléfono
- Datos de sesión y actividad en la App
- Wallet USDT proporcionada por el usuario
- Información capturada durante el proceso KYC (foto del documento, selfie, verificación biométrica)

No recopilamos datos que no sean necesarios para la operación del servicio.

2. Uso de la información

Usamos sus datos para:

- Crear y administrar su cuenta
- Verificar identidad (KYC)
- Permitir compras de MXI en la etapa de desarrollo
- Administrar el sistema de referidos
- Procesar solicitudes de retiro
- Mejorar la seguridad y prevenir fraude
- Enviar notificaciones relacionadas con su cuenta o cambios de la App

Sus datos no se venden ni se intercambian con terceros.

3. Bases legales

El tratamiento se fundamenta en:

- Su consentimiento al registrarse
- Cumplimiento de obligaciones de verificación (KYC/AML)
- Prevención de fraude
- Ejecución del servicio contratado

4. Almacenamiento y protección

MXI adopta medidas técnicas y administrativas para proteger la información, incluyendo:

- Encriptación
- Acceso restringido
- Controles antifraude
- Servidores seguros

Ningún sistema es completamente invulnerable, pero aplicamos buenas prácticas internacionales de seguridad.

5. Compartición de datos

Podemos compartir datos únicamente con:

- Proveedores de verificación KYC
- Servicios de análisis o seguridad
- Autoridades competentes si la ley lo exige

No compartimos datos con terceros para fines comerciales.

6. Retención de datos

Conservamos sus datos mientras su cuenta esté activa y durante el tiempo requerido para:

- Cumplir obligaciones legales
- Resolver disputas
- Prevenir actividades fraudulentas

Puede solicitar eliminación de su cuenta, excepto cuando existan obligaciones regulatorias pendientes.

7. Derechos del usuario

Usted puede:

- Acceder a sus datos
- Rectificarlos
- Actualizarlos
- Solicitar eliminación
- Retirar su consentimiento
- Limitar el tratamiento

Para ejercer estos derechos, puede contactarnos vía soporte dentro de la App.

8. Transferencias internacionales

Sus datos pueden ser procesados en países con leyes de protección distintas a las suyas. Al usar la App, usted autoriza tales transferencias, siempre bajo medidas de seguridad adecuadas.

9. Menores de edad

El uso de la App está restringido a personas mayores de 18 años. Eliminaremos cualquier cuenta creada por menores.

10. Cambios en esta Política

Podemos actualizar esta Política en cualquier momento. La versión vigente estará disponible dentro de la App. El uso continuado implica aceptación de los cambios.

11. Contacto

Para consultas o solicitudes relacionadas con privacidad puede comunicarse mediante el soporte oficial de la App.

Versión 1.1 – Vigente desde 15/01/2026.`,
    
    // Admin Panel - User Management
    userManagement: 'Gestión de Usuarios',
    searchPlaceholder: 'Buscar por nombre, email, ID...',
    loadingUsers: 'Cargando usuarios...',
    all: 'Todos',
    actives: 'Activos',
    inactive: 'Inactivos',
    blocked: 'Bloqueados',
    noUsersFound: 'No se encontraron usuarios',
    adjustSearchFilters: 'Ajusta tu búsqueda o filtros',
    refs: 'refs',
    joined: 'Unido',
    userDetails: 'Detalles del Usuario',
    blockUser: 'Bloquear Usuario',
    blockUserConfirm: '¿Estás seguro de que quieres bloquear este usuario?',
    block: 'Bloquear',
    blockedByAdmin: 'Bloqueado por administrador',
    userBlockedSuccess: 'Usuario bloqueado exitosamente',
    errorBlockingUser: 'Error al bloquear usuario',
    unblockUser: 'Desbloquear Usuario',
    unblockUserConfirm: '¿Estás seguro de que quieres desbloquear este usuario?',
    unblock: 'Desbloquear',
    userUnblockedSuccess: 'Usuario desbloqueado exitosamente',
    errorUnblockingUser: 'Error al desbloquear usuario',
    failedToLoadSettings: 'Error al cargar configuración',
    
    // Home Screen
    hello: 'Hola',
    welcomeToMXI: 'Bienvenido a MXI',
    phasesAndProgress: 'Fases y Progreso',
    currentPhase: 'Fase Actual',
    usdtPerMXI: 'USDT por MXI',
    phase: 'Fase',
    sold: 'Vendido',
    remaining: 'Restante',
    generalProgress: 'Progreso General',
    of: 'de',
    totalMXIDelivered: 'Total MXI Entregado',
    mxiDeliveredToAllUsers: 'MXI entregado a todos los usuarios (todas las fuentes)',
    poolClose: 'El pool cierra el',
    perMXIText: 'por MXI',
    
    // Launch Countdown
    officialLaunch: 'Lanzamiento Oficial',
    maxcoinMXI: 'MAXCOIN (MXI)',
    launchDate: '15 de febrero de 2026 a las 12:00 UTC',
    presaleStart: 'Inicio de Preventa',
    presaleEnd: 'Finalización de Preventa',
    days: 'Días',
    hours: 'Horas',
    minutes: 'Minutos',
    seconds: 'Segundos',
    poolActive: 'Pool Activo',
    vestingRealTime: 'Vesting en Tiempo Real',
    
    // Total MXI Balance Chart
    totalMXIBalance: 'Saldo Total MXI',
    allSourcesIncluded: 'Todas las fuentes incluidas',
    noBalanceHistory: 'No hay historial de saldo disponible',
    chartShowsDynamicBalance: 'Este gráfico muestra tu saldo total de MXI a lo largo del tiempo, incluyendo todas las fuentes: compras, comisiones, torneos y vesting.',
    loadingChart: 'Cargando gráfico...',
    purchased: 'Comprado',
    commissions: 'Comisiones',
    tournaments: 'Torneos',
    vesting: 'Vesting',
    completeBreakdown: 'Desglose Completo',
    mxiPurchased: 'MXI Comprado',
    mxiCommissions: 'Comisiones MXI',
    mxiTournaments: 'Torneos MXI',
    vestingRealTimeLabel: 'Vesting (Tiempo Real)',
    updatingEverySecond: 'Actualizando cada segundo',
    mxiTotal: 'MXI Total',
    balanceChangeTimestamps: 'Marcas de Tiempo de Cambios de Saldo',
    
    // Yield Display
    vestingMXI: 'Vesting MXI',
    generatingPerSecond: 'Generando {{rate}} MXI por segundo',
    mxiPurchasedVestingBase: 'MXI Comprado (Base de Vesting)',
    onlyPurchasedMXIGeneratesVesting: 'Solo el MXI comprado genera vesting',
    currentSession: 'Sesión Actual',
    totalAccumulated: 'Total Acumulado',
    perSecond: 'Por Segundo',
    perMinute: 'Por Minuto',
    perHour: 'Por Hora',
    dailyYield: 'Rendimiento Diario',
    claimYield: 'Reclamar Rendimiento',
    claiming: 'Reclamando...',
    yieldInfo: 'El vesting se genera automáticamente desde tu MXI comprado. Puedes reclamarlo una vez que cumplas los requisitos de retiro.',
    noYield: 'Sin Rendimiento',
    needMoreYield: 'Necesitas acumular más rendimiento antes de reclamar.',
    requirementsNotMet: 'Requisitos No Cumplidos',
    claimRequirements: 'Necesitas 5 referidos activos para reclamar rendimiento. Actual: {{count}}/5',
    kycRequired: 'KYC Requerido',
    kycRequiredMessage: 'Necesitas completar la verificación KYC antes de reclamar rendimiento.',
    yieldClaimed: 'Rendimiento Reclamado',
    yieldClaimedMessage: '¡Reclamaste exitosamente {{amount}} MXI!',
    claimFailed: 'Reclamo Fallido',
    requirementsToWithdraw: 'Requisitos para Retirar',
    activeReferralsForGeneralWithdrawals: '5 Referidos Activos para retiros generales ({{count}}/5)',
    kycApproved: 'KYC Aprobado',
    
    // Ecosystem Screen
    ecosystem: 'Ecosistema',
    liquidityPool: 'Pool de Liquidez',
    whatIsMXI: '¿Qué es MXI?',
    howItWorksTab: 'Cómo Funciona',
    whyBuy: 'Por Qué Comprar',
    meta: 'Meta',
    ecosystemTab: 'Ecosistema',
    quantumSecurity: 'Seguridad Cuántica',
    sustainability: 'Sostenibilidad',
    dailyVesting: 'Vesting Diario',
    inPractice: 'En la Práctica',
    tokenomics: 'Tokenómica',
    risks: 'Riesgos',
    
    // Ecosystem Tab Content - NEW CONTENT
    ecosystemTabTitle: 'Ecosistema MXI',
    ecosystemIntro: '🌐 MXI es un ecosistema, no es solo un token: es una infraestructura completa diseñada para operar como una economía digital autosostenible, capaz de integrar productos, servicios, tecnología y comunidad dentro de un mismo entorno interconectado. Cada elemento está diseñado para alimentar a los demás, generando flujo, utilidad y crecimiento real tanto para usuarios, emprendedores e inversores.',
    ecosystemApproach: '🚀 Nuestro enfoque convierte a MXI en un entorno vivo, escalable y funcional, donde todas las soluciones se conectan para crear valor continuo y descentralizado.',
    ecosystemComponentsTitle: 'Componentes del Ecosistema MXI',
    ecosystemComponentsSubtitle: 'A continuación, se enumeran y explican los pilares que hacen de MXI un verdadero ecosistema:',
    ecosystemComponent1Title: '1. 💎 Token MXI (núcleo del ecosistema)',
    ecosystemComponent1Desc: 'El token es la base sobre la cual se construye toda la economía MXI: transacciones, recompensas, votaciones, pagos, gobernanza y acceso a servicios.',
    ecosystemComponent2Title: '2. 🔐 MXI Wallet Multicapa',
    ecosystemComponent2Desc: 'Billetera inteligente con arquitectura de seguridad cuántica, preparada para amenazas futuras y enfocada en proteger activos, identidades y transacciones.',
    ecosystemComponent3Title: '3. 💰 Plataforma DeFi MXI',
    ecosystemComponent3Desc: 'Incluye:',
    ecosystemComponent3Point1: '- Staking y recompensas automatizadas',
    ecosystemComponent3Point2: '- Pools de liquidez',
    ecosystemComponent3Point3: '- Préstamos descentralizados para emprendedores',
    ecosystemComponent3Point4: '- Mecanismos de rendimiento sostenibles',
    ecosystemComponent4Title: '4. 🚀 MXI Launchpad para emprendedores',
    ecosystemComponent4Desc: 'Espacio para que nuevos proyectos reciban financiamiento dentro del ecosistema usando MXI, impulsando la economía real y la innovación.',
    ecosystemComponent5Title: '5. 💳 MXI Pay & Tarjeta MXI',
    ecosystemComponent5Desc: 'Una tarjeta interoperable que permite usar MXI en comercios, pagos diarios, compras globales y retiros. Diseñada para integrar finanzas digitales y vida cotidiana.',
    ecosystemComponent6Title: '6. 🛡️ Sistema de Seguridad Cuántica',
    ecosystemComponent6Desc: 'Nuestra infraestructura adopta algoritmos resistentes a la computación cuántica, anticipándose a los retos tecnológicos de la próxima década.',
    ecosystemComponent7Title: '7. 🌍 Marketplace e Integraciones Web3',
    ecosystemComponent7Desc: 'Proyectos, servicios, productos y utilidades que usan MXI como medio de pago y de intercambio, fortaleciendo la circulación del valor.',
    ecosystemComponent8Title: '8. 🗳️ Programa de Gobernanza Comunitaria',
    ecosystemComponent8Desc: 'La comunidad vota, propone y decide el rumbo del ecosistema. Si MXI crece, todos ganan.',
    ecosystemComponent9Title: '9. 📚 MXI Academy (formación & comunidad)',
    ecosystemComponent9Desc: 'Educación financiera, blockchain y desarrollo de proyectos para empoderar a emprendedores e inversores.',
    ecosystemSummaryTitle: 'Resumen',
    ecosystemSummaryIntro: 'MXI es un ecosistema porque integra:',
    ecosystemSummaryPoint1: 'Token',
    ecosystemSummaryPoint2: 'Wallet',
    ecosystemSummaryPoint3: 'Seguridad cuántica',
    ecosystemSummaryPoint4: 'Plataforma DeFi',
    ecosystemSummaryPoint5: 'Tarjeta y pagos',
    ecosystemSummaryPoint6: 'Launchpad',
    ecosystemSummaryPoint7: 'Marketplace',
    ecosystemSummaryPoint8: 'Gobernanza',
    ecosystemSummaryPoint9: 'Formación',
    ecosystemSummaryPoint10: 'Comunidad',
    ecosystemSummaryConclusion: '✨ Todo conectado para crear una economía descentralizada real, donde la cooperación multiplica el valor.',
    
    // Sustainability Tab Content - NEW CONTENT
    sustainabilityIntro: '💎 MXI es sostenible a largo plazo porque su modelo económico se basa en utilidad real, crecimiento orgánico y participación comunitaria. A diferencia de proyectos especulativos, MXI incorpora servicios que generan movimiento constante del token: pagos, marketplace, préstamos, staking, tarjeta, herramientas para emprendedores y programas de valor compartido. Cada servicio alimenta al ecosistema, evitando la dependencia de nuevos compradores para sostener la economía.',
    sustainabilityDecentralized: '🌍 Además, el enfoque descentralizado permite que la comunidad impulse decisiones clave, creando un sistema adaptable, autosuficiente y resistente a crisis externas. La adopción de tecnologías avanzadas como la seguridad cuántica, la modularidad de su arquitectura y el enfoque en economía real garantizan que MXI evolucione, se expanda y permanezca relevante durante las próximas décadas.',
    
    // Vesting Diario Tab Content - NEW CONTENT
    vestingDiarioIntro: 'El Vesting Diario es un mecanismo diseñado para proteger la estabilidad del proyecto durante la preventa y, al mismo tiempo, brindar a los inversionistas una forma justa, predecible y sostenible de recibir sus tokens. En lugar de liberar todos los tokens de inmediato —lo que suele generar caídas drásticas por ventas masivas— MXI distribuye las asignaciones de forma progresiva, equilibrada y transparente.',
    vestingDiarioHowItWorks: 'Desde el momento en que un usuario adquiere MXI en preventa, su saldo total queda registrado en un contrato inteligente que administra la liberación diaria. Cada 24 horas, un porcentaje predefinido del total comprado se libera de forma automática, permitiendo al usuario retirarlo, transferirlo o usarlo dentro del ecosistema. Este proceso garantiza que todos los participantes tengan acceso gradual a sus tokens sin saturar el mercado, mientras el proyecto avanza en desarrollo, crecimiento de usuarios, integración de servicios financieros y expansión del ecosistema.',
    vestingDiarioBenefits: 'El objetivo es crear un equilibrio natural entre oferta y demanda, lo que fortalece la valoración del token y beneficia a los primeros inversores con un modelo sostenible.',
    vestingDiarioTransparency: 'Además, el vesting diario es parte del compromiso de MXI con la transparencia: cada liberación puede auditarse en la blockchain, y los usuarios mantienen el control total sobre su flujo de tokens sin depender de intermediarios.',
    vestingDiarioSummaryTitle: 'En resumen, el vesting diario es una herramienta diseñada para:',
    vestingDiarioBenefit1: '🛡️ Proteger el valor del token y evitar caídas abruptas.',
    vestingDiarioBenefit2: '📈 Acompañar el crecimiento real del ecosistema.',
    vestingDiarioBenefit3: '🤝 Crear igualdad entre los inversionistas en la etapa inicial.',
    vestingDiarioBenefit4: '🔍 Garantizar trazabilidad y seguridad en cada liberación.',
    vestingDiarioBenefit5: '🔄 Ofrecer liquidez progresiva sin comprometer la sostenibilidad.',
    vestingDiarioConclusion: 'Con este modelo, MXI construye un escenario responsable y de proyección a futuro, donde cada miembro de la comunidad recibe su parte de forma equilibrada, mientras el proyecto desarrolla las bases de una economía real descentralizada.',
    
    // Quantum Security Tab Content - UPDATED CONTENT
    quantumSecurityTitle: 'Seguridad Cuántica',
    quantumSecurityIntro: '🔐 MXI integrará seguridad cuántica mediante algoritmos post-cuánticos certificados, técnicas de encriptación resistentes a computación cuántica y estructuras de identidad digital imposibles de vulnerar incluso ante ataques avanzados.',
    quantumSecurityTechnical: '⚛️ Esto incluye algoritmos basados en redes lattices, firmas criptográficas resistentes y protocolos de intercambio de claves capaces de enfrentar fuerzas de cálculo superiores.',
    quantumSecurityNecessity: '⚠️ Esta seguridad es necesaria porque el avance de la computación cuántica representa un riesgo real para las criptomonedas, los sistemas bancarios y toda la infraestructura digital actual.',
    quantumSecurityExpansion: '✨ MXI adopta esta tecnología para sus primeras fases expansivas garantizando que su ecosistema permanezca seguro, confiable y preparado para las exigencias tecnológicas del futuro, protegiendo tanto a inversores como a proyectos y emprendedores.',
    
    // In Practice Tab Content - NEW KEYS (using quantum security content)
    inPracticeIntro: '🔐 MXI integrará seguridad cuántica mediante algoritmos post-cuánticos certificados, técnicas de encriptación resistentes a computación cuántica y estructuras de identidad digital imposibles de vulnerar incluso ante ataques avanzados.',
    inPracticeTechnical: '⚛️ Esto incluye algoritmos basados en redes lattices, firmas criptográficas resistentes y protocolos de intercambio de claves capaces de enfrentar fuerzas de cálculo superiores.',
    inPracticeNecessity: '⚠️ Esta seguridad es necesaria porque el avance de la computación cuántica representa un riesgo real para las criptomonedas, los sistemas bancarios y toda la infraestructura digital actual.',
    inPracticePresale: '✨ MXI adopta esta tecnología desde la fase de preventa para garantizar que su ecosistema permanezca seguro, confiable y preparado para las exigencias tecnológicas del futuro, protegiendo tanto a inversores como a proyectos y emprendedores.',
    
    // Tokenomics Tab Content - NEW CONTENT
    tokenomicsIntro: 'La tokenómica de MXI ha sido diseñada para crear un ecosistema sólido, escalable y preparado para el futuro. Nuestro modelo híbrido combina tres pilares: 1) utilidad real, 2) crecimiento algorítmico programado, y 3) fortalecimiento comunitario. Esto permite que MXI mantenga estabilidad, crea demanda progresiva y entregue beneficios tanto al pequeño como al gran inversor.',
    
    // Section 1: Hybrid Model Structure
    tokenomicsSection1Title: '🔹 1. Estructura del Modelo Híbrido',
    tokenomicsSection1Intro: 'El modelo económico de MXI opera sobre tres mecanismos simultáneos:',
    tokenomicsSection1ATitle: 'A. Oferta controlada con liberación inteligente (Vesting Diario)',
    tokenomicsSection1ADesc: 'Cada compra en preventa entra en un sistema de liberación diaria automática, lo que:',
    tokenomicsSection1APoint1: 'Reduce la presión de venta.',
    tokenomicsSection1APoint2: 'Aumenta la estabilidad del precio.',
    tokenomicsSection1APoint3: 'Garantiza flujo constante de liquidez.',
    tokenomicsSection1ABenefit: 'Beneficio directo: incluso antes del listado, los poseedores reciben un token con demanda orgánica creciente.',
    tokenomicsSection1BTitle: 'B. Crecimiento impulsado por demanda + quema progresiva',
    tokenomicsSection1BDesc: 'MXI integra un algoritmo de ajuste dinámico, donde:',
    tokenomicsSection1BPoint1: 'Una parte de las comisiones se quema.',
    tokenomicsSection1BPoint2: 'Otra se reinvierte en liquidez y desarrollo.',
    tokenomicsSection1BModel: 'Esto genera un modelo deflacionario controlado: con mayor uso → menor oferta → mayor valorización.',
    tokenomicsSection1CTitle: 'C. Token de utilidad + economía descentralizada',
    tokenomicsSection1CDesc: 'MXI será usado dentro del ecosistema para:',
    tokenomicsSection1CPoint1: 'Pagos.',
    tokenomicsSection1CPoint2: 'Acceso a herramientas Web3.',
    tokenomicsSection1CPoint3: 'Créditos descentralizados.',
    tokenomicsSection1CPoint4: 'Recompensa.',
    tokenomicsSection1CPoint5: 'Identidad digital cuántica.',
    tokenomicsSection1CUtility: 'La utilidad real evita que MXI dependa solo de especulación.',
    
    // Section 2: Model Advantages
    tokenomicsSection2Title: '🔹 2. Ventajas del Modelo con Cifras Proyectadas',
    tokenomicsSection2Intro: 'Basado en precios oficiales:',
    tokenomicsSection2TableTitle: 'Etapa | Precio',
    tokenomicsSection2Phase1: 'Preventa 1: 0.40 USDT',
    tokenomicsSection2Phase2: 'Preventa 2: 0.70 USDT',
    tokenomicsSection2Phase3: 'Preventa 3: 1.00 USDT',
    tokenomicsSection2Listing: 'Precio estimado de listado: 3.00 USDT',
    tokenomicsSection2ProjectionTitle: 'Proyección de valorización inicial',
    tokenomicsSection2Projection1: 'Compra en 0.40 → potencial x7.5 al listado.',
    tokenomicsSection2Projection2: 'Compra en 0,70 → x4,2.',
    tokenomicsSection2Projection3: 'Compra en 1.00 → x3.',
    tokenomicsSection2Conclusion: 'Estas cifras se fortalecen con el modelo híbrido, que estabiliza el mercado evitando caídas bruscas.',
    
    // Section 3: Comparison with Other Cryptocurrencies
    tokenomicsSection3Title: '🔹 3. ¿Por qué es superior al modelo de otras criptomonedas?',
    tokenomicsSection3BTCTitle: 'BTC – escasez pura',
    tokenomicsSection3BTCPro1: 'deflacionario',
    tokenomicsSection3BTCCon1: 'sin utilidad programable',
    tokenomicsSection3BTCCon2: 'alta volatilidad',
    tokenomicsSection3BTCConclusion: 'MXI combina escasez más utilidad real.',
    tokenomicsSection3ETHTitle: 'ETH – gas y contratos inteligentes',
    tokenomicsSection3ETHPro1: 'gran ecosistema',
    tokenomicsSection3ETHCon1: 'comisiones variables',
    tokenomicsSection3ETHConclusion: 'MXI integra utilidad + bajas comisiones + seguridad cuántica.',
    tokenomicsSection3ADATitle: 'ADA – enfoque académico y escalabilidad',
    tokenomicsSection3ADAPro1: 'estructura sólida',
    tokenomicsSection3ADACon1: 'adopción lenta',
    tokenomicsSection3ADAConclusion: 'MXI prioriza uso inmediato (pagos, préstamos, identidad).',
    tokenomicsSection3SOLTitle: 'SOL – alta velocidad',
    tokenomicsSection3SOLPro1: 'transacciones rápidas',
    tokenomicsSection3SOLCon1: 'historial de caídas y centralización',
    tokenomicsSection3SOLConclusion: 'MXI combina velocidad con seguridad cuántica + estabilidad económica.',
    
    // Section 4: Direct Benefits for Investors
    tokenomicsSection4Title: '🔹 4. Beneficios Directos para el Inversionista',
    tokenomicsSection4ShortTerm: 'Corto plazo',
    tokenomicsSection4ShortPoint1: 'Ganancia por precio bajo de preventa.',
    tokenomicsSection4ShortPoint2: 'Adquisición diaria como flujo controlado.',
    tokenomicsSection4MediumTerm: 'Mediano plazo',
    tokenomicsSection4MediumPoint1: 'Primeros casos de uso del token.',
    tokenomicsSection4MediumPoint2: 'Expansión del ecosistema: tarjeta MXI, pagos, servicios Web3.',
    tokenomicsSection4LongTerm: 'Largo plazo',
    tokenomicsSection4LongPoint1: 'Préstamos descentralizados.',
    tokenomicsSection4LongPoint2: 'Gobernanza comunitaria.',
    tokenomicsSection4LongPoint3: 'Apreciación del precio por quema + adopción real.',
    
    // Conclusion
    tokenomicsConclusionTitle: 'MXI: un modelo diseñado para crecer con su comunidad',
    tokenomicsConclusionText: 'Cuanto más crece el ecosistema, más se fortalece el valor del token y todos ganan: emprendedores, inversores y usuarios reales.',
    
    // Investor Profiles - En la Práctica Tab
    investorProfilesIntro: 'A continuación se explican tres perfiles de inversores y cómo MXI podría generarles utilidad real en distintos horizontes de tiempo, usando las cifras de crecimiento proyectado.',
    
    // Basic Investor
    basicInvestorTitle: '🟦 1. Inversor Básico (Compra Directa – Sin Participar en Retos)',
    shortTermLabel: 'Corto Plazo (0–6 meses)',
    basicInvestorShortTerm: 'Compra en preventa a 0.40 – 0.70 – 1.00 USDT. Si el token se lista a 3 USDT, su utilidad inmediata sería:',
    basicInvestorTable: 'Precio compra | Ganancia potencial al listado (3 USDT) | % Aproximado\n0.40 | 650% | +650%\n0.70 | 328% | +328%\n1.00 | 200% | +200%',
    basicInvestorExample: 'Ejemplo práctico: Compra 1,000 MXI a 0.40 = 400 USDT → Al listar a 3 USDT → 3,000 USDT.',
    mediumTermLabel: 'Mediano Plazo (6–18 meses)',
    basicInvestorMediumTerm: 'Liberación diaria del vesting, lo que reduce presión de venta y aumenta estabilidad. Puede usar MXI dentro del ecosistema para:',
    basicInvestorMediumPoint1: '✔ Pagos con tarjeta',
    basicInvestorMediumPoint2: '✔ Comisiones reducidas',
    basicInvestorMediumPoint3: '✔ Participación temprana en nuevos productos MXI',
    longTermLabel: 'Largo Plazo (18+ meses)',
    basicInvestorLongTerm: 'Si MXI cumple el objetivo de economía descentralizada, el token pasa a tener:',
    basicInvestorLongPoint1: '✔ Valor de utilidad',
    basicInvestorLongPoint2: '✔ Valor de comunidad',
    basicInvestorLongPoint3: '✔ Posible apreciación por adopción',
    
    // Participative Investor
    participativeInvestorTitle: '🟩 2. Inversor Participativo (Compra + Vesting Diario + Referidos)',
    participativeInvestorShortTerm: 'Obtiene las mismas ganancias potenciales del inversor básico.',
    referralBonusLabel: 'BONUS DE REFERIDOS:',
    participativeInvestorBonus: 'Si invita a 10 personas que compran 500 USDT cada una: Supongamos un bono del 5% → gana 250 USDT adicionales en MXI. Estos MXI también entran al vesting diario.',
    participativeInvestorMediumTerm: 'Con el vesting diario, recibe liberaciones constantes.',
    participativeInvestorExample: 'Ejemplo: Compra 2,000 USDT → recibe 2,000 MXI a 1 USDT. Vesting diario al 1% (ejemplo) = 20 MXI diarios. Si el precio sube de 1 a 3 USDT, cada liberación vale más.',
    participativeInvestorLongTerm: 'Su portafolio crece por 3 vías simultáneas:',
    participativeInvestorLongPoint1: '• Apreciación del precio',
    participativeInvestorLongPoint2: '• Liberación del vesting',
    participativeInvestorLongPoint3: '• MXI acumulado por referidos activos',
    participativeInvestorConclusion: 'Es el perfil con mayor potencial de crecimiento compuesto.',
    
    // Strategic Investor
    strategicInvestorTitle: '🟧 3. Inversor Estratégico (Compra + Vesting + Referidos + Retos Opcionales)',
    strategicInvestorIntro: 'Este perfil aprovecha todas las fuentes de crecimiento del ecosistema MXI.',
    strategicInvestorShortTerm: 'Rentabilidad inmediata por preventa → listado. Bonos adicionales por completar retos:',
    strategicInvestorChallengePoint1: '• Desafíos de volumen',
    strategicInvestorChallengePoint2: '• Misiones comunitarias',
    strategicInvestorChallengePoint3: '• Aportar liquidez en el lanzamiento',
    strategicInvestorExample: 'Ejemplo: Compra 5,000 USDT a 0.40 = 12,500 MXI. Gana un 10% adicional por retos = 1,250 MXI extra. Si el precio sube a 3 USDT → esos 1,250 MXI valen 3,750 USDT.',
    strategicInvestorMediumTerm: 'Gran flujo diario por vesting debido a mayor volumen de compra. Sube nivel en el ecosistema → más beneficios:',
    strategicInvestorMediumPoint1: '✔ Acceso prioritario a productos',
    strategicInvestorMediumPoint2: '✔ Recompensas aumentadas',
    strategicInvestorMediumPoint3: '✔ Más bonificación por referidos',
    strategicInvestorLongTerm: 'Participa en la gobernanza del ecosistema. Acceso a rondas privadas de proyectos integrados en MXI.',
    strategicInvestorBenefits: 'Beneficio compuesto extremo:',
    strategicInvestorBenefitPoint1: '✔ Precio MXI',
    strategicInvestorBenefitPoint2: '✔ Vesting',
    strategicInvestorBenefitPoint3: '✔ Retos',
    strategicInvestorBenefitPoint4: '✔ Referidos',
    strategicInvestorBenefitPoint5: '✔ Crecimiento de la red',
    
    // Meta Tab Content - NEW CONTENT
    metaTitle: 'Nuestra Meta',
    metaIntro: '🎯 Nuestra meta es construir una economía real, descentralizada y sostenible, diseñada para liberar a las personas y a los negocios de la dependencia del sistema financiero tradicional. Nuestro propósito es simple pero poderoso: crear un ecosistema donde el crecimiento sea impulsado por la comunidad, no por las instituciones centrales, enfocados como primera medida, al público latinoamericano, sus necesidades y fortalezas.',
    metaVision: '💎 MXI nace con una visión clara: democratizar las oportunidades económicas. Por eso, nuestro ecosistema integrará soluciones reales como sistemas de préstamos peer-to-peer, apoyo directo a emprendedores, herramientas para inversores y mecanismos de liquidez que favorecen el desarrollo de la comunidad. Cuando la comunidad crece, MXI crece; y cuando MXI avanza, todos ganan.',
    metaModel: '🔗 Buscamos construir un modelo económico en el que el valor no esté controlado por unos pocos, sino distribuido entre quienes participan activamente. Nuestro enfoque combina tecnología blockchain avanzada, seguridad cuántica de nueva generación y una infraestructura diseñada para escalar globalmente, creando un entorno seguro, transparente y preparado para los desafíos del futuro.',
    metaObjective: '🚀 El objetivo final es consolidar a MXI como un motor de desarrollo:',
    metaObjectivePoint1: '• Un puente real para emprendedores que necesitan financiación',
    metaObjectivePoint2: '• Una alternativa sólida para inversores que buscan crecimiento descentralizado',
    metaObjectivePoint3: '• Un ecosistema autosostenible en el que cada contribución fortalece el sistema completo',
    metaConclusion: '✨ MXI no es solo un token: es una visión compartida. Y si la comunidad lo apoya, MXI se convierte en una fuerza económica capaz de transformar realidades.',
    
    // Why Buy Tab Content - NEW CONTENT
    whyBuyTitle: '¿Por Qué Comprar MXI?',
    whyBuyIntro: '💎 Comprar MXI en preventa es una oportunidad estratégica porque permite entrar antes de que el ecosistema esté completamente operativo, accediendo a precios que no volverán a repetirse.',
    whyBuyReason1: '1️⃣ Precio Preferencial y Ventaja Temprana',
    whyBuyReason1Desc: 'El token está disponible desde 0.40 USDT, con proyecciones optimistas entre 4.5 y 8 USDT a medida que se activen pagos, tarjeta y expansión comercial.',
    whyBuyReason2: '2️⃣ Emisión Limitada y Alta Demanda Proyectada',
    whyBuyReason2Desc: 'Solo existirán 50 millones de tokens. La utilidad real (pagos, torneos, recompensas, tarjeta) aumenta la presión de demanda a futuro.',
    whyBuyReason3: '3️⃣ Ecosistema con Utilidad Inmediata',
    whyBuyReason3Desc: 'No compras solo un token: compras acceso a una red que podrás usar para pagar, competir, enviar dinero y consumir servicios.',
    whyBuyReason4: '4️⃣ Seguridad Cuántica Integrada',
    whyBuyReason4Desc: 'MXI nace preparado para el futuro, con tecnología de protección avanzada que aumenta su valor diferencial frente a otros proyectos.',
    whyBuyReason5: '5️⃣ Tarjeta MXI: Uso Real del Token',
    whyBuyReason5Desc: 'Tu MXI no queda guardado: podrás usarlo en cualquier comercio, al instante.',
    whyBuyReason6: '6️⃣ Proyecto Diseñado para Crecer en el Corto Plazo',
    whyBuyReason6Desc: 'La hoja de ruta despliega funciones rápidamente: vesting activo, torneos, herramientas, comercios, marketplace y migración futura a blockchain propio.',
    whyBuyReason7: '7️⃣ Ventaja de Ser de los Primeros',
    whyBuyReason7Desc: 'Entrar temprano no es solo más económico: te posiciona antes del crecimiento, la adopción masiva y la expansión internacional.',
    whyBuyConclusion: '✨ MXI es una oportunidad de preventa para quienes quieren participar al inicio de un ecosistema diseñado con visión, tecnología y utilidad real.',
    investmentAdvantages: 'Ventajas de Inversión',
    growthPotential: 'Potencial de Crecimiento',
    growthPotentialDesc: 'Entrada temprana a precios preferenciales',
    limitedSupply: 'Suministro Limitado',
    limitedSupplyDesc: 'Solo 50 millones de tokens',
    realUtility: 'Utilidad Real',
    realUtilityDesc: 'Pagos, torneos y tarjeta',
    globalCommunity: 'Comunidad Global',
    globalCommunityDesc: 'Red internacional en crecimiento',
    
    // How It Works Tab - UPDATED CONTENT
    howItWorksTitle: 'Cómo Funciona MXI',
    howItWorksIntro: '🚀 MXI funciona como un ecosistema en expansión diseñado para crecer por fases, asegurando que cada etapa impulse la siguiente. Hoy nos encontramos en preventa, la fase más temprana y estratégica del proyecto, donde los primeros participantes obtienen acceso anticipado al token antes de su integración total en el sistema.',
    step1Title: '1️⃣ Adquisición Temprana del Token (Preventa)',
    step1Description: 'Durante esta etapa, los usuarios compran MAXCoin (MXI) a precios preferenciales (0.40, 0.70 y 1.00 USDT). Estos tokens no se liberan todos de inmediato: entran en un sistema automatizado de vesting que garantiza estabilidad y distribución controlada.',
    step2Title: '2️⃣ Vesting Diario Inteligente',
    step2Description: 'Los tokens adquiridos se liberan mediante un Vesting Diario del 3% mensual, calculado y liberado minuto a minuto. Este mecanismo asegura tres cosas:\n\n• Circulación progresiva\n• Protección del mercado\n• Mayor sostenibilidad del precio\n\nEn otras palabras, recibes tus tokens de forma constante y predecible sin saturar la oferta.',
    step3Title: '3️⃣ Ecosistema en Construcción Activa',
    step3Description: 'Mientras los usuarios reciben MXI, el equipo desarrolla e integra los componentes centrales:\n\n• MXI App: gestión de saldos, vesting, red de expansión y herramientas internas\n• Torneos de habilidad: recompensas generadas por participación real\n• MXI Pay: sistema de pagos con conversión instantánea\n• Tarjeta MXI: que te permitirá usar tu saldo en cualquier comercio compatible\n• Seguridad Cuántica: algoritmos post-cuánticos que blindan transacciones y claves\n\nTodo esto se activa por etapas conforme se completa la preventa.',
    step4Title: '4️⃣ Entrada a Mercado y Fase de Expansión',
    step4Description: 'Una vez la preventa finalice y la app esté en operación completa, MXI inicia su ciclo de crecimiento:\n\n• Utilidad diaria del token\n• Integración con comercios\n• Marketplace interno\n• Expansión internacional\n• Futura migración a su propio blockchain\n\nEsto es clave: la valorización se impulsa por uso, no por especulación.\n\n✨ MXI funciona como un sistema vivo: te permite entrar temprano, recibir tu token de forma ordenada y acompañar el crecimiento de un ecosistema diseñado para escalar en los próximos meses.',
    keyBenefits: 'Beneficios Clave',
    instantTransactions: 'Transacciones Instantáneas',
    instantTransactionsDesc: 'Transacciones rápidas y seguras en la blockchain',
    maximumSecurity: 'Máxima Seguridad',
    maximumSecurityDesc: 'Protegido con tecnología de encriptación cuántica',
    globalAccess: 'Acceso Global',
    globalAccessDesc: 'Disponible 24/7 desde cualquier parte del mundo',
    
    // What is MXI? Tab - NEW CONTENT
    whatIsMXITitle: '¿Qué es MXI?',
    whatIsMXIIntro: '🚀 MXI es un proyecto cripto–tecnológico en construcción que hoy se encuentra en fase de prelanzamiento estratégico, permitiendo a los primeros participantes acceder de forma anticipada a un ecosistema diseñado para expandirse rápidamente en los próximos meses. Su token nativo, MAXCoin (MXI), posee una emisión limitada de 50 millones y un modelo económico basado en utilidad real, vesting diario y liquidez programada.',
    whatIsMXIEarlyStage: '⚡ Durante esta etapa temprana, MXI se está estructurando para convertirse en una red integral de pagos, recompensas, torneos de habilidad, integración con comercios y una tarjeta vinculada a la billetera MXI, que permitirá usar los saldos en cualquier momento. El proyecto incorpora además un sistema de seguridad cuántica orientado a proteger transacciones y claves frente a tecnologías emergentes, garantizando un ecosistema preparado para el futuro.',
    whatIsMXIPresale: '💎 En preventa, MXI ofrece acceso a precios iniciales inferiores al valor proyectado del token una vez se activen las funciones principales del ecosistema. Es la fase donde se construye la base: comunidad, liquidez inicial, mecanismos internos y conexión progresiva con las herramientas del proyecto.',
    whatIsMXINotJustToken: '🎯 MXI no es solo un token: es un modelo diseñado para crecer rápido, integrar servicios reales y posicionarse como una infraestructura digital lista para escalar en el corto plazo.',
    
    // How MXI Works - NEW CONTENT
    howMXIWorksTitle: '¿Cómo funciona MXI?',
    howMXIWorksIntro: 'MXI funciona mediante un sistema modular de componentes que se activan progresivamente:',
    howMXIWorksStep1Title: '1️⃣ Preventa con acceso anticipado',
    howMXIWorksStep1Desc: 'Los usuarios adquieren MXI a precios preferenciales antes del lanzamiento oficial. Desde el primer día, el sistema genera una versión simulada del saldo que luego entra en vesting.',
    howMXIWorksStep2Title: '2️⃣ Vesting Diario del 3% mensual',
    howMXIWorksStep2Desc: 'Los tokens se liberan de manera fraccionada minuto a minuto, evitando concentraciones y manteniendo la circulación controlada.',
    howMXIWorksStep3Title: '3️⃣ Ecosistema interno en expansión',
    howMXIWorksStep3Desc: 'Incluye:',
    howMXIWorksStep3Point1: '• Pagos entre usuarios',
    howMXIWorksStep3Point2: '• Torneos de habilidad',
    howMXIWorksStep3Point3: '• Recompensas por participación',
    howMXIWorksStep3Point4: '• Herramientas para crecimiento y comunidad',
    howMXIWorksStep4Title: '4️⃣ Tarjeta vinculada',
    howMXIWorksStep4Desc: 'Permitirá usar MXI o USDT directamente en comercios físicos y digitales, convirtiendo la utilidad del token en algo inmediato y práctico.',
    howMXIWorksStep5Title: '5️⃣ Seguridad cuántica',
    howMXIWorksStep5Desc: 'Encriptación resistente a tecnologías emergentes para proteger transacciones, activos y claves privadas.',
    howMXIWorksStep6Title: '6️⃣ Expansión progresiva',
    howMXIWorksStep6Desc: 'El proyecto migrará a un blockchain propio cuando la comunidad y la infraestructura lo justifiquen, aumentando velocidad, escalabilidad y eficiencia.',
    howMXIWorksConclusion: '✨ MXI funciona como un ecosistema vivo que se activa por etapas, diseñado para aumentar utilidad, adopción y valor conforme evoluciona.',
    
    // Profile Screen
    profile: 'Perfil',
    totalBalance: 'Saldo Total',
    mxiPurchased: 'MXI Comprado',
    mxiPurchasedLabel: 'Comprado',
    mxiCommissionsLabel: 'Comisiones',
    mxiVestingLabel: 'Vesting',
    mxiTournamentsLabel: 'Torneos',
    adminPanel: 'Panel de Administración',
    manageUsers: 'Gestionar usuarios y sistema',
    memberSince: 'Miembro desde',
    mxiCommissions: 'Comisiones MXI',
    rejected: 'Rechazado',
    areYouSureLogout: '¿Estás seguro de que quieres cerrar sesión?',
    approved: 'Aprobado',
    notSubmitted: 'No Enviado',
    editProfile: 'Editar Perfil',
    updateYourInfo: 'Actualiza tu información',
    kycVerification: 'Verificación KYC',
    viewYieldGeneration: 'Ver generación de rendimiento',
    withdrawalHistory: 'Historial de Retiros',
    viewPreviousWithdrawals: 'Ver retiros anteriores',
    challengeHistory: 'Historial de Desafíos',
    viewGameRecords: 'Ver registros de juegos',
    getHelp: 'Obtener ayuda',
    vestingAndYield: 'Vesting y Rendimiento',
    
    // Edit Profile Screen
    editProfileText: 'Editar Perfil',
    profileLockedText: 'Perfil Bloqueado',
    profileCannotBeEditedText: 'Tu perfil no puede ser editado mientras tu estado KYC es {{status}}.',
    profileInfoCanOnlyBeModifiedText: 'La información del perfil solo puede modificarse antes de enviar la verificación KYC o después del rechazo.',
    backToProfileText: 'Volver al Perfil',
    importantNoticeText: 'Aviso Importante',
    canOnlyEditBeforeKYCText: 'Solo puedes editar la información de tu perfil antes de enviar la verificación KYC o si tu KYC fue rechazado.',
    personalInformationText: 'Información Personal',
    fullNameText: 'Nombre Completo',
    enterYourFullNameText: 'Ingresa tu nombre completo',
    enterFullLegalNameText: 'Ingresa tu nombre legal completo como aparece en tu identificación',
    idNumberText: 'Número de Identificación',
    enterYourIDNumberText: 'Ingresa tu número de identificación',
    enterNationalIDText: 'Ingresa tu número de identificación nacional o pasaporte',
    residentialAddressText: 'Dirección de Residencia',
    enterYourResidentialAddressText: 'Ingresa tu dirección de residencia',
    enterCompleteAddressText: 'Ingresa tu dirección de residencia completa',
    emailAndReferralCannotChangeText: 'El correo electrónico y el código de referido no se pueden cambiar',
    emailAddressReadOnlyText: 'Correo Electrónico (Solo lectura)',
    referralCodeReadOnlyText: 'Código de Referido (Solo lectura)',
    saveChangesText: 'Guardar Cambios',
    pleaseEnterFullNameText2: 'Por favor ingresa tu nombre completo',
    pleaseEnterAddressText: 'Por favor ingresa tu dirección',
    pleaseEnterIDNumberText: 'Por favor ingresa tu número de identificación',
    idNumberAlreadyRegisteredText: 'Este número de identificación ya está registrado por otro usuario',
    successText2: 'Éxito',
    profileUpdatedSuccessfullyText: 'Perfil actualizado exitosamente',
    failedToUpdateProfileText: 'Error al actualizar el perfil. Por favor intenta de nuevo.',
    
    // KYC Verification Screen
    completeYourKYCVerification: 'Completa tu verificación KYC',
    loadingKYCData: 'Cargando datos de KYC...',
    verificationStatus: 'Estado de Verificación',
    verifiedOn: 'Verificado el',
    yourKYCIsBeingReviewed: 'Tu verificación KYC está siendo revisada por nuestro equipo. Esto generalmente toma 24-48 horas.',
    rejectionReason: 'Razón del Rechazo',
    pleaseCorrectIssues: 'Por favor corrige los problemas y vuelve a enviar tu verificación.',
    whyKYCRequired: '¿Por qué se requiere KYC?',
    kycMandatoryForWithdrawals: 'KYC es obligatorio para retiros',
    helpPreventFraud: 'Ayuda a prevenir fraude y lavado de dinero',
    ensureCompliance: 'Asegura el cumplimiento de las regulaciones',
    protectYourAccount: 'Protege tu cuenta y fondos',
    oneTimeVerification: 'Proceso de verificación único',
    personalInformation: 'Información Personal',
    fullLegalName: 'Nombre Legal Completo',
    enterFullNameAsOnID: 'Ingresa tu nombre completo como aparece en tu identificación',
    documentType: 'Tipo de Documento',
    nationalID: 'Identificación Nacional',
    passport: 'Pasaporte',
    driversLicense: 'Licencia de Conducir',
    documentNumber: 'Número de Documento',
    enterYourDocumentNumber: 'Ingresa tu número de documento',
    frontDocument: 'Frente del Documento',
    uploadClearPhotoOfFront: 'Sube una foto clara del frente de tu documento',
    uploading: 'Subiendo...',
    tapToChange: 'Toca para cambiar',
    tapToUploadFront: 'Toca para subir el frente',
    backDocument: 'Reverso del Documento',
    uploadClearPhotoOfBack: 'Sube una foto clara del reverso de tu documento',
    tapToUploadBack: 'Toca para subir el reverso',
    submitting: 'Enviando...',
    submitKYCVerification: 'Enviar Verificación KYC',
    yourDataIsSecure: 'Tus Datos están Seguros',
    dataEncryptedAndSecure: 'Todos tus datos están encriptados y almacenados de forma segura. Nunca compartimos tu información con terceros.',
    kycVerified: 'KYC Verificado',
    identityVerifiedSuccessfully: 'Tu identidad ha sido verificada exitosamente. Ahora puedes realizar retiros.',
    loadingUserData: 'Cargando datos del usuario...',
    pleaseEnterFullNameText: 'Por favor ingresa tu nombre completo',
    pleaseEnterDocumentNumber: 'Por favor ingresa tu número de documento',
    pleaseUploadFrontDocument: 'Por favor sube el frente de tu documento',
    pleaseUploadBackDocument: 'Por favor sube el reverso de tu documento',
    authenticationErrorText: 'Error de autenticación. Por favor inicia sesión de nuevo.',
    errorSubmittingKYC: 'Error al enviar la verificación KYC. Por favor intenta de nuevo.',
    kycSubmittedSuccessfully: 'KYC Enviado Exitosamente',
    kycUnderReview: 'Tu verificación KYC ha sido enviada y está bajo revisión. Serás notificado una vez que sea aprobada.',
    submissionError: 'Error de Envío',
    errorUploadingDocument: 'Error al subir el documento. Por favor intenta de nuevo.',
    successUploadDocument: 'Subida Exitosa',
    frontDocumentUploaded: 'Documento frontal subido exitosamente',
    backDocumentUploaded: 'Documento trasero subido exitosamente',
    uploadError: 'Error de Subida',
    
    // Support Screen
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
    describeIssueInDetailText: 'Describe tu problema en detalle',
    sendMessageButtonText: 'Enviar Mensaje',
    messageSentSuccessText: 'Tu mensaje ha sido enviado exitosamente. Nuestro equipo responderá en 24-48 horas.',
    failedToSendMessageErrorText: 'Error al enviar el mensaje. Por favor intenta de nuevo.',
    noMessagesYetTitleText: 'Aún No Hay Mensajes',
    createSupportRequestMessageText: 'Crea una solicitud de soporte para obtener ayuda de nuestro equipo',
    messageDetail: 'Detalle del Mensaje',
    messageDetailComingSoonText: 'Vista de detalle del mensaje próximamente',
    repliesCountText: 'respuestas',
    failedToLoadMessages: 'Error al cargar mensajes',
    pleaseEnterSubjectAndMessageText: 'Por favor ingresa tanto el asunto como el mensaje',
    
    // Admin Panel
    backToHome: 'Volver al Inicio',
    adminDashboard: 'Panel de Administración',
    welcome: 'Bienvenido',
    dangerZone: 'ZONA DE PELIGRO',
    dangerZoneSubtitle: 'Reinicia todos los contadores de MXI a 0 (INCLUYENDO EL ADMINISTRADOR). Las relaciones de referidos se preservarán. Esta acción es IRREVERSIBLE.',
    resetAll: 'Reiniciar Todo',
    presaleMetrics: 'Métricas de Preventa',
    totalSold: 'Total Vendido',
    totalMembers: 'Total Miembros',
    progress: 'Progreso',
    users: 'Usuarios',
    active: 'Activo',
    totalUSDT: 'Total USDT',
    totalMXI: 'Total MXI',
    quickActions: 'Acciones Rápidas',
    manualVerifications: 'Verificaciones Manuales',
    advancedManagement: 'Gestión Avanzada',
    creditManualPayment: 'Acreditar Pago Manual',
    approveKYC: 'Aprobar KYC',
    withdrawals: 'Retiros',
    supportMessages: 'Mensajes Soporte',
    basicUsers: 'Usuarios Básico',
    vestingAnalytics: 'Vesting Analytics',
    settings: 'Configuración',
    resetSystemTitle: '¿Reiniciar Todo el Sistema?',
    resetSystemMessage: 'Esta acción es IRREVERSIBLE y reiniciará todos los contadores a 0 (INCLUYENDO EL ADMINISTRADOR):',
    resetWarning1: 'Todos los saldos MXI y USDT se pondrán en 0 (incluyendo admin)',
    resetWarning2: 'Se eliminarán todas las comisiones',
    resetWarning3: 'Se eliminarán todas las contribuciones',
    resetWarning4: 'Se eliminarán todos los retiros',
    resetWarning5: 'Se eliminarán todos los pagos y órdenes',
    resetWarning6: 'Las métricas de preventa se reiniciarán a 0',
    resetWarning7: 'Todo el vesting se eliminará',
    resetWarning8: 'El balance del administrador también se reiniciará a 0',
    resetPreserved: 'Las relaciones de referidos SE PRESERVARÁN',
    typeResetToConfirm: 'Escribe "RESETEAR" para confirmar:',
    confirmReset: 'Confirmar Reset',
    mustTypeReset: 'Debes escribir "RESETEAR" para confirmar',
    systemReset: 'Sistema Reiniciado',
    systemResetSuccess: 'La página se recargará para actualizar los datos.',
    updateComplete: 'Actualización Completa',
    updateCompleteMessage: 'Todos los datos han sido actualizados. El balance del administrador ahora es 0.',
    resetError: 'Error al reiniciar el sistema',
    accessDenied: 'Acceso Denegado',
    noAdminPermissions: 'No tienes permisos de administrador',
    
    // Rewards Screen
    rewards: 'Recompensas',
    loadingRewards: 'Cargando recompensas...',
    earnMXIMultipleWays: 'Gana MXI de múltiples formas',
    totalMXIEarned: 'Total MXI Ganado',
    bonus: 'Bono',
    rewardPrograms: 'Programas de Recompensas',
    participationBonus: 'Bono de Participación',
    participateInWeeklyDrawings: 'Participa en sorteos semanales',
    generatePassiveIncome: 'Genera ingresos pasivos',
    live: 'En Vivo',
    referralSystem: 'Sistema de Referidos',
    earnCommissionsFrom3Levels: 'Gana comisiones de 3 niveles',
    moreRewardsComingSoon: '¡Más Recompensas Próximamente!',
    workingOnNewRewards: 'Estamos trabajando en nuevas formas de recompensar a nuestra comunidad',
    tournamentsAndCompetitions: 'Torneos y Competencias',
    achievementBonuses: 'Bonos por Logros',
    loyaltyRewards: 'Recompensas por Lealtad',
    specialEvents: 'Eventos Especiales',
    benefitsOfRewards: 'Beneficios de las Recompensas',
    earnAdditionalMXI: 'Gana MXI adicional más allá de tu compra inicial',
    participateInExclusiveDrawings: 'Participa en sorteos y bonos exclusivos',
    generateAutomaticPassiveIncome: 'Genera ingresos pasivos automáticos a través del vesting',
    bonusesForActiveReferrals: 'Bonos por mantener referidos activos',
    rewardsForContinuedParticipation: 'Recompensas por participación continua',
    maximizeYourRewards: 'Maximiza tus Recompensas',
    keepAtLeast5ActiveReferrals: 'Mantén al menos 5 referidos activos',
    participateRegularlyInBonus: 'Participa regularmente en el Bono MXI',
    activateVestingForPassiveIncome: 'Activa el vesting para ingresos pasivos',
    shareYourReferralCode: 'Comparte tu código de referido con amigos',
    
    // Lottery/Bonus Participation Screen
    bonusParticipation: 'Bono de Participación',
    loadingBonusText: 'Cargando bono...',
    failedToLoadBonusData: 'Error al cargar datos del bono',
    noActiveBonusRoundText: 'No hay ronda de bono activa',
    retryButton: 'Reintentar',
    roundText: 'Ronda',
    openText: 'Abierto',
    lockedText: 'Bloqueado',
    prizePoolText: 'Pozo de Premios',
    totalPoolText: 'Pozo Total',
    ticketsSoldText: 'Boletos Vendidos',
    ticketPriceText: 'Precio del Boleto',
    yourTicketsText: 'Tus Boletos',
    availableMXIText: 'MXI Disponible',
    purchaseTicketsText: 'Comprar Boletos',
    buyBetween1And20TicketsText: 'Compra entre 1 y 20 boletos',
    buyTicketsText: 'Comprar Boletos',
    howItWorksBonusText: 'Cómo Funciona',
    eachTicketCosts2MXIText: 'Cada boleto cuesta 2 MXI',
    buyBetween1And20TicketsPerRoundText: 'Compra entre 1 y 20 boletos por ronda',
    roundLocksWhen1000TicketsSoldText: 'La ronda se bloquea cuando se venden 1,000 boletos',
    winnerReceives90PercentText: 'El ganador recibe el 90% del pozo',
    winnerAnnouncedOnSocialMediaText: 'El ganador se anuncia en redes sociales',
    purchaseIsFinalNoRefundsText: 'La compra es final, sin reembolsos',
    numberOfTicketsText: 'Número de Boletos',
    enterQuantityText: 'Ingresa cantidad',
    ticketsText: 'Boletos',
    pricePerTicketText: 'Precio por Boleto',
    totalCostText: 'Costo Total',
    cancelButton: 'Cancelar',
    continueButton: 'Continuar',
    selectPaymentSourceText: 'Seleccionar Fuente de Pago',
    chooseWhichMXIBalanceText: 'Elige qué saldo de MXI usar',
    mxiPurchasedSourceText: 'MXI Comprado',
    mxiFromCommissionsSourceText: 'MXI de Comisiones',
    mxiFromChallengesSourceText: 'MXI de Desafíos',
    pleaseEnterValidQuantity: 'Por favor ingresa una cantidad válida (1-20)',
    insufficientBalance: 'Saldo Insuficiente',
    insufficientBalanceNeedForTicketsText: 'Necesitas {{needed}} MXI para {{quantity}} boletos pero solo tienes {{available}} MXI disponibles',
    insufficientBalanceInSourceText: 'Saldo insuficiente en {{source}}. Disponible: {{available}} MXI, Necesario: {{needed}} MXI',
    failedToDeductBalance: 'Error al deducir saldo',
    failedToPurchaseTicketsText: 'Error al comprar boletos',
    successTitle: 'Éxito',
    successfullyPurchasedTicketsText: 'Compraste exitosamente {{count}} boletos por {{cost}} MXI de {{source}}',
    onlyUsePurchasedCommissionsOrTournamentsText: 'Solo usa MXI de compras, comisiones o torneos para comprar boletos',
    
    // Admin - Participation Bonus Management
    participationBonusManagement: 'Gestión de Bono de Participación',
    manageBonusSettings: 'Gestionar configuración del bono y participantes',
    bonusSettings: 'Configuración del Bono',
    currentRound: 'Ronda Actual',
    roundNumber: 'Número de Ronda',
    maxParticipants: 'Máximo de Participantes',
    ticketsSold: 'Boletos Vendidos',
    totalPool: 'Pozo Total',
    prizePool: 'Pozo de Premios',
    roundStatus: 'Estado de la Ronda',
    open: 'Abierto',
    locked: 'Bloqueado',
    drawn: 'Sorteado',
    completed: 'Completado',
    updateSettings: 'Actualizar Configuración',
    resetBonus: 'Reiniciar Bono',
    downloadParticipants: 'Descargar Participantes',
    maxParticipantsLabel: 'Máximo de Participantes',
    ticketPriceLabel: 'Precio del Boleto (MXI)',
    enterMaxParticipants: 'Ingresa máximo de participantes',
    enterTicketPrice: 'Ingresa precio del boleto',
    updateBonusSettings: 'Actualizar Configuración del Bono',
    resetBonusConfirmTitle: '¿Reiniciar Bono de Participación?',
    resetBonusConfirmMessage: 'Esto hará:\n\n• Cerrar la ronda actual\n• Crear una nueva ronda con la configuración actual\n• Reiniciar todos los contadores a 0\n\nEsta acción no se puede deshacer.',
    resetBonusSuccess: 'Bono reiniciado exitosamente',
    resetBonusError: 'Error al reiniciar el bono',
    updateSettingsSuccess: 'Configuración actualizada exitosamente',
    updateSettingsError: 'Error al actualizar la configuración',
    downloadingParticipants: 'Descargando participantes...',
    noParticipantsYet: 'Aún no hay participantes',
    participantsList: 'Lista de Participantes',
    downloadComplete: 'Descarga Completa',
    participantsDownloaded: 'Datos de participantes descargados exitosamente',
    downloadError: 'Error al descargar participantes',
    bonusManagementActions: 'Acciones de Gestión del Bono',
    resetBonusButton: 'Reiniciar Bono a 0',
    updateLimitsButton: 'Actualizar Límites',
    downloadDataButton: 'Descargar Datos de Participantes',
    currentBonusStats: 'Estadísticas Actuales del Bono',
    participantsCount: 'Participantes',
    totalTicketsSold: 'Total de Boletos Vendidos',
    currentPrizePool: 'Pozo de Premios Actual',
    settingsUpdatedSuccessfully: 'Configuración actualizada exitosamente',
    bonusResetSuccessfully: 'Bono reiniciado exitosamente. Nueva ronda creada.',
    confirmResetBonus: 'Confirmar Reinicio del Bono',
    typeResetBonusToConfirm: 'Escribe "RESETEAR BONO" para confirmar:',
    mustTypeResetBonus: 'Debes escribir "RESETEAR BONO" para confirmar',
    participantData: 'Datos del Participante',
    ticketNumber: 'Número de Boleto',
    userName: 'Nombre del Usuario',
    userEmail: 'Email del Usuario',
    purchaseDate: 'Fecha de Compra',
    ticketQuantity: 'Cantidad',
    changesWillAffectCurrentRoundText: 'Los cambios afectarán la ronda actual inmediatamente',
    more: 'más',
    locale: 'es',
    
    // Vesting Screen
    mxiVestingBalance: 'Saldo de Vesting MXI',
    loadingVestingDataText: 'Cargando datos de vesting...',
    vestingSourceTitle: 'Fuente de Vesting',
    vestingSourceDescriptionText: 'El vesting se genera solo del MXI comprado directamente. Las comisiones y ganancias de torneos no generan vesting.',
    mxiPurchasedVestingBaseText: 'MXI Comprado (Base de Vesting)',
    mxiInVestingText: 'MXI en Vesting',
    availableForWithdrawalText: 'Disponible para retiro',
    blockedUntilLaunchText: 'Bloqueado hasta el lanzamiento',
    daysRemainingText: 'días restantes',
    balanceBlockedTitle: 'Saldo Bloqueado',
    balanceBlockedDescriptionText: 'Tu saldo de vesting está bloqueado hasta el lanzamiento oficial de MXI. Después del lanzamiento, podrás retirar tu MXI en liberaciones progresivas.',
    timeUntilLaunchText: 'Tiempo Hasta el Lanzamiento',
    releasedText: 'Liberado',
    vestingInformationText: 'Información de Vesting',
    releasePercentageText: 'Porcentaje de Liberación',
    everyTenDaysText: 'cada 10 días',
    releasesCompletedText: 'Liberaciones Completadas',
    nextReleaseText: 'Próxima Liberación',
    withdrawalStatusText: 'Estado de Retiro',
    enabledText: 'Habilitado',
    blockedUntilLaunchShortText: 'Bloqueado hasta el lanzamiento',
    whatIsVestingText: '¿Qué es el Vesting?',
    vestingDescriptionText: 'El vesting es un sistema que bloquea tu MXI comprado hasta el lanzamiento oficial. Esto asegura estabilidad y valor a largo plazo para el token.',
    vestingReleaseInfoText: 'Después del lanzamiento, el {{percentage}}% de tu saldo de vesting se libera cada 10 días, permitiéndote retirar gradualmente tu MXI.',
    vestingReleaseInfoPreLaunchText: 'Después del lanzamiento, el {{percentage}}% de tu saldo de vesting se liberará cada 10 días, permitiéndote retirar gradualmente tu MXI.',
    vestingImportantNoteText: '⚠️ Importante: Solo el MXI comprado directamente genera vesting. Las comisiones y ganancias de torneos están disponibles inmediatamente (con requisitos).',
    withdrawMXIText: 'Retirar MXI',
    withdrawVestingBalanceText: 'Retira tu saldo de vesting',
    
    // Referrals Page
    commissionsByReferrals: 'Comisiones por Referidos',
    yourReferralCode: 'Tu Código de Referido',
    shareCode: 'Compartir Código',
    shareReferralCode: 'Únete a MXI con mi código de referido',
    commissionBalance: 'Saldo de Comisiones',
    totalEarnedByReferrals: 'Total Ganado por Referidos',
    allCommissionsCreditedMXI: 'Todas las comisiones se acreditan directamente en MXI',
    yourReferrals: 'Tus Referidos',
    level: 'Nivel',
    referralsText: 'referidos',
    activeReferralsLevel1: 'Referidos Activos (Nivel 1)',
    howCommissionsWork: 'Cómo Funcionan las Comisiones',
    earn5PercentLevel1: 'Gana 5% en MXI de referidos de Nivel 1',
    earn2PercentLevel2: 'Gana 2% en MXI de referidos de Nivel 2',
    earn1PercentLevel3: 'Gana 1% en MXI de referidos de Nivel 3',
    commissionsCalculatedOnMXI: 'Las comisiones se calculan sobre las compras de MXI',
    need5ActiveReferrals: 'Necesitas 5 referidos activos para retirar',
    minimumWithdrawalIs50MXI: 'El retiro mínimo es de 50 MXI',
    viewWithdrawalHistory: 'Ver Historial de Retiros',
    
    // Embajadores MXI
    ambassadorsMXI: 'Embajadores MXI',
    earnBonusesForReferrals: 'Gana bonos por tus referidos',
    earnAdditionalBonusesForReferrals: 'Gana bonos adicionales por tus referidos',
    yourCurrentLevel: 'Tu Nivel Actual',
    accumulatedValidPurchases: 'Compras Válidas Acumuladas',
    fromDirectReferrals: 'De referidos directos (Nivel 1)',
    progressToNextLevel: 'Progreso al Siguiente Nivel',
    withdrawableBonus: 'Bono Retirable',
    cumulativeBonusesAvailable: 'Bonos acumulativos disponibles',
    withdrawBonus: 'Retirar Bono',
    allLevels: 'Todos los Niveles',
    withdrawalRequirements: 'Requisitos para Retirar',
    levelMustBeFullyAchieved: 'Tener el nivel alcanzado completamente',
    mustHaveApprovedKYC: 'Debe tener KYC aprobado',
    mustHaveMinimum1PersonalPurchase: 'Debe tener mínimo 1 compra personal',
    withdrawalMethodUSDTTRC20Only: 'Método de retiro: USDT TRC20 solamente',
    importantInformation: 'Información Importante',
    bonusesAdditionalTo5Percent: 'Los bonos son adicionales al 5% de comisión por referidos',
    allBonusesAreCumulative: 'Todos los bonos son acumulativos',
    onlyLevel1ReferralPurchasesCount: 'Solo cuentan compras de referidos directos (Nivel 1)',
    minimumAmountPerPurchase50USDT: 'Monto mínimo por compra: 50 USDT',
    onlyPresalePurchasesPaidInUSDT: 'Solo compras en preventa pagadas en USDT',
    usdtTRC20Address: 'Dirección USDT TRC20',
    enterYourTRC20Address: 'Ingresa tu dirección TRC20',
    onlyUSDTTRC20WithdrawalsAllowed: 'Solo se permiten retiros en USDT TRC20',
    confirmBonusWithdrawal: 'Confirmar Retiro de Bono',
    withdrawalRequestSentSuccessfully: 'Solicitud de retiro enviada exitosamente',
    noBonusesAvailableToWithdraw: 'No tienes bonos disponibles para retirar',
    addressRequired: 'Dirección Requerida',
    pleaseEnterYourUSDTTRC20Address: 'Por favor ingresa tu dirección USDT TRC20',
    invalidAddress: 'Dirección Inválida',
    pleaseEnterValidTRC20Address: 'Por favor ingresa una dirección USDT TRC20 válida (debe comenzar con T y tener 34 caracteres)',
    noLevelAchievedYet: 'Aún no has alcanzado ningún nivel',
    needValidPurchasesFromLevel1: 'Necesitas {{amount}} USDT en compras válidas de referidos de Nivel 1',
    
    // Deposit Page
    deposit: 'Depósito',
    buyMXIWithMultipleOptions: 'Compra MXI con múltiples opciones',
    currentBalance: 'Saldo Actual',
    usdtContributed: 'USDT Contribuido',
    loadingHistory: 'Cargando historial...',
    currentPresalePhase: 'Fase Actual de Preventa',
    activePhase: 'Fase Activa',
    phaseOf: 'Fase {{current}} de {{total}}',
    currentPrice: 'Precio Actual',
    perMXI: 'por MXI',
    tokensSold: 'Tokens Vendidos',
    untilNextPhase: 'Hasta la Próxima Fase',
    paymentOptions: 'Opciones de Pago',
    chooseYourPreferredPaymentMethod: 'Elige tu método de pago preferido',
    multiCryptoPayment: 'Pago Multi-Cripto',
    availableCryptocurrencies: 'Criptomonedas Disponibles',
    bitcoinEthereumUSDTUSDC: 'Bitcoin, Ethereum, USDT, USDC',
    multipleNetworks: 'Múltiples Redes',
    automaticConfirmation: 'Confirmación Automática',
    directUSDTPayment: 'Pago Directo en USDT',
    manualUSDTTransfer: 'Transferencia Manual de USDT',
    usdtOnMultipleNetworks: 'USDT en múltiples redes',
    manualVerificationAvailable: 'Verificación manual disponible',
    dedicatedSupport: 'Soporte Dedicado',
    manualPaymentVerification: 'Verificación Manual de Pagos',
    requestManualVerificationOfPayments: 'Solicita verificación manual de pagos',
    completePaymentHistory: 'Historial completo de pagos',
    verificationByAdministrator: 'Verificación por administrador',
    responseInLessThan2Hours: 'Respuesta en menos de 2 horas',
    transactionHistory: 'Historial de Transacciones',
    viewVerifyAndManageYourPayments: 'Ver, verificar y gestionar tus pagos',
    supportedCryptocurrencies: 'Criptomonedas Soportadas',
    payWithAnyOfTheseCoinsAndMore: 'Paga con cualquiera de estas monedas y más',
    bitcoin: 'Bitcoin',
    ethereum: 'Ethereum',
    usdt: 'USDT',
    usdc: 'USDC',
    bnb: 'BNB',
    solana: 'Solana',
    litecoin: 'Litecoin',
    more50Plus: '50+ Más',
    howItWorks: 'Cómo Funciona',
    chooseYourPaymentMethod: 'Elige tu Método de Pago',
    selectBetweenMultiCryptoOrDirectUSDT: 'Selecciona entre multi-cripto o USDT directo',
    enterTheAmount: 'Ingresa el Monto',
    specifyHowMuchUSDTYouWantToInvest: 'Especifica cuánto USDT quieres invertir',
    makeThePayment: 'Realiza el Pago',
    sendTheExactAmountToTheProvidedAddress: 'Envía el monto exacto a la dirección proporcionada',
    receiveYourMXI: 'Recibe tus MXI',
    tokensWillBeCreditedAutomatically: 'Los tokens se acreditarán automáticamente',
    advantagesOfOurPaymentSystem: 'Ventajas de Nuestro Sistema de Pago',
    automaticConfirmationInMinutes: 'Confirmación automática en minutos',
    secureAndVerifiedOnBlockchain: 'Seguro y verificado en blockchain',
    multiplePaymentOptionsAvailable: 'Múltiples opciones de pago disponibles',
    available247WithoutIntermediaries: 'Disponible 24/7 sin intermediarios',
    paymentMethods: 'Métodos de Pago',
    cryptocurrencies: 'Criptomonedas',
    available247: 'Disponible 24/7',
    
    // USDT Payment (pagar-usdt.tsx)
    payInUSDT: 'Pagar en USDT',
    selectPaymentNetwork: 'Selecciona la Red de Pago',
    eachNetworkValidatesIndependently: 'Cada red valida independientemente',
    networkDescription: 'Pagos en {{network}}',
    validationIn: 'Validación en {{network}}',
    paymentsOnlyValidatedOnNetwork: 'Los pagos solo se validan en {{network}}',
    paymentInstructions: 'Instrucciones de Pago',
    selectNetworkYouWillUse: 'Selecciona la red que usarás ({{label}})',
    sendUSDTFromAnyWallet: 'Envía USDT desde cualquier billetera',
    minimumAmountLabel: 'Monto mínimo: {{min}} USDT',
    copyTransactionHash: 'Copia el hash de transacción',
    pasteHashAndVerify: 'Pega el hash y verifica',
    youWillReceiveMXI: 'Recibirás MXI a una tasa de {{rate}}:1',
    recipientAddress: 'Dirección Destinataria ({{label}})',
    addressCopiedToClipboard: 'copiado al portapapeles',
    onlySendUSDTOnNetwork: 'Solo envía USDT en {{network}} ({{label}})',
    mxiCalculator: 'Calculadora MXI',
    transactionHashTxHash: 'Hash de Transacción (TxHash)',
    pasteYourTransactionHash: 'Pega tu hash de transacción de {{network}}',
    correctLength: '✅ Longitud correcta (66 caracteres)',
    charactersCount: '{{count}} caracteres',
    verifyAutomatically: 'Verificar Automáticamente',
    requestManualVerificationButton: 'Solicitar Verificación Manual',
    sendingRequestText: 'Enviando solicitud...',
    importantValidationByNetwork: 'Importante: Validación por Red',
    eachNetworkValidatesIndependentlyInfo: 'Cada red valida independientemente',
    paymentsOnETHOnlyValidatedOnETH: 'Los pagos en Ethereum solo se validan en Ethereum',
    paymentsOnBNBOnlyValidatedOnBNB: 'Los pagos en BNB Chain solo se validan en BNB Chain',
    paymentsOnPolygonOnlyValidatedOnPolygon: 'Los pagos en Polygon solo se validan en Polygon',
    ensureCorrectNetworkBeforeVerifying: 'Asegúrate de seleccionar la red correcta antes de verificar',
    transactionMustHave3Confirmations: 'La transacción debe tener al menos 3 confirmaciones',
    cannotUseSameHashTwice: 'No puedes usar el mismo hash dos veces',
    ifAutomaticFailsUseManual: 'Si la verificación automática falla, usa la verificación manual',
    
    // USDT Payment - Verification Errors
    pleaseEnterTransactionHash: 'Por favor ingresa el hash de transacción',
    invalidHash: 'Hash Inválido',
    hashMustStartWith0x: 'El hash debe comenzar con 0x y tener 66 caracteres (actual: {{count}})',
    confirmNetworkTitle: 'Confirmar Red',
    areYouSureTransaction: '¿Estás seguro de que la transacción se realizó en {{network}} ({{label}})?',
    yesVerifyButton: 'Sí, Verificar',
    verifying: 'Verificando...',
    hashDuplicateTitle: 'Hash Duplicado',
    hashAlreadyRegisteredText: 'Este hash ya está registrado en la orden {{order}} con estado: {{status}}',
    databaseErrorText: 'Error de base de datos: {{message}}',
    transactionNotFound: 'Transacción No Encontrada',
    transactionNotFoundText: 'Transacción no encontrada en {{network}}. Por favor verifica el hash y la red.',
    waitingConfirmations: 'Esperando Confirmaciones',
    waitingConfirmationsText: '{{message}} ({{confirmations}}/{{required}} confirmaciones)',
    insufficientAmountTitle: 'Monto Insuficiente',
    insufficientAmountText: 'El monto mínimo es {{min}} USDT. {{message}} ({{usdt}} USDT, mínimo: {{minimum}} USDT)',
    alreadyProcessed: 'Ya Procesado',
    alreadyProcessedText: 'Esta transacción ya ha sido procesada',
    invalidTransfer: 'Transferencia Inválida',
    invalidTransferText: 'No se encontró una transferencia válida de USDT a la dirección {{address}} en {{network}}',
    transactionFailed: 'Transacción Fallida',
    transactionFailedText: 'La transacción falló en la blockchain',
    invalidNetworkTitle: 'Red Inválida',
    invalidNetworkText: 'La red seleccionada no es válida',
    configurationError: 'Error de Configuración',
    configurationErrorText: 'Error de configuración RPC: {{message}}',
    incorrectNetwork: 'Red Incorrecta',
    incorrectNetworkText: 'La transacción no se realizó en la red seleccionada',
    authenticationError: 'Error de Autenticación',
    incompleteData: 'Datos Incompletos',
    incompleteDataText: 'Faltan datos requeridos',
    databaseError: 'Error de Base de Datos',
    rpcConnectionError: 'Error de Conexión RPC',
    rpcConnectionErrorText: 'No se pudo conectar a la blockchain: {{message}}',
    internalError: 'Error Interno',
    internalErrorText: 'Error interno del servidor: {{message}}',
    unknownError: 'Error Desconocido',
    unknownErrorText: 'Ocurrió un error desconocido',
    connectionError: 'Error de Conexión',
    connectionErrorText: 'Error de conexión: {{message}}',
    paymentConfirmedTitle: '¡Pago Confirmado!',
    paymentConfirmedText: '✅ ¡{{amount}} MXI acreditados exitosamente!\n\nRed: {{network}}\nMonto: {{usdt}} USDT',
    viewBalance: 'Ver Saldo',
    verificationError: 'Error de Verificación',
    
    // Manual Verification Request
    requestManualVerificationTitle: 'Solicitar Verificación Manual',
    doYouWantToSendManualRequest: '¿Quieres enviar una solicitud de verificación manual para esta transacción?\n\nRed: {{network}} ({{label}})\nHash: {{hash}}',
    requestSentSuccessfullyTitle: 'Solicitud Enviada Exitosamente',
    manualVerificationRequestSentText: '¡Solicitud de verificación manual enviada exitosamente!\n\nOrden: {{order}}\nRed: {{network}}\nHash: {{hash}}\n\nUn administrador revisará tu pago en 24-48 horas.',
    viewTransactions: 'Ver Transacciones',
    errorSendingRequestTitle: 'Error al Enviar Solicitud',
    couldNotSendVerificationRequestText: 'No se pudo enviar la solicitud de verificación: {{error}} (Código: {{code}})',
    
    // Manual Verification Screen
    manualVerification: 'Verificación Manual',
    nowPayments: 'NowPayments',
    directUSDT: 'USDT Directo',
    verificationOfNowPayments: 'Verificación de NowPayments',
    viewHistoryAndRequestManualVerification: 'Ve tu historial de pagos y solicita verificación manual si es necesario',
    noNowPaymentsRegistered: 'No hay pagos de NowPayments registrados aún',
    verificationOfUSDT: 'Verificación de USDT',
    requestManualVerificationOfUSDT: 'Solicita verificación manual de tus pagos en USDT',
    requestManualUSDTVerification: 'Solicitar Verificación Manual de USDT',
    doYouWantToRequestManualVerification: '¿Quieres solicitar verificación manual para esta transacción?\n\nRed: {{network}} ({{label}})\nHash: {{hash}}',
    usdtPaymentHistory: 'Historial de Pagos USDT',
    noUSDTPaymentsRegistered: 'No hay pagos USDT registrados aún',
    manualVerificationRequested: 'Verificación manual solicitada',
    administratorReviewingPayment: 'El administrador está revisando tu pago',
    administratorRequestsMoreInfo: 'El Administrador Solicita Más Información',
    informationRequested: 'Información Solicitada:',
    responseSent: 'Respuesta Enviada',
    manualVerificationApproved: 'Verificación manual aprobada',
    rejectedReason: 'Rechazado: {{reason}}',
    noReason: 'Sin razón proporcionada',
    paymentCreditedSuccessfully: 'Pago acreditado exitosamente',
    existingRequest: 'Solicitud Existente',
    existingRequestMessage: 'Ya existe una solicitud de verificación para este pago con estado: {{status}}',
    requestManualVerificationNowPayments: 'Solicitar Verificación Manual',
    doYouWantToRequestNowPaymentsVerification: '¿Quieres solicitar verificación manual para este pago?\n\nMonto: {{amount}} USDT\nMXI: {{mxi}}\nOrden: {{order}}',
    requestSentMessage: 'Solicitud de verificación manual enviada exitosamente. Un administrador la revisará pronto.',
    respondToAdministrator: 'Responder al Administrador',
    yourResponse: 'Tu Respuesta',
    writeYourResponseHere: 'Escribe tu respuesta aquí...',
    responseSentToAdministrator: 'Respuesta enviada al administrador exitosamente',
    errorSendingResponse: 'Error al enviar respuesta',
    
    // Payment Status
    completed: 'Completado',
    confirmed: 'Confirmado',
    waitingForPayment: 'Esperando Pago',
    confirming: 'Confirmando',
    failed: 'Fallido',
    expired: 'Expirado',
    couldNotLoadVestingInfo: 'No se pudo cargar la información',
    
    // Transaction History
    transactionHistoryTitle: 'Historial de Transacciones',
    pendingTransactions: 'Pendientes',
    successfulTransactions: 'Exitosas',
    failedTransactions: 'Fallidas',
    purchaseMXINowPayments: 'Compra MXI (NowPayments)',
    purchaseMXIOKX: 'Compra MXI (OKX)',
    manualPayment: 'Pago Manual',
    commission: 'Comisión',
    allTransactions: 'Todas',
    couldNotLoadTransactionHistory: 'No se pudo cargar el historial de transacciones',
    couldNotOpenPaymentLink: 'No se pudo abrir el enlace de pago',
    cancelTransaction: 'Cancelar Transacción',
    areYouSureCancelTransaction: '¿Estás seguro de que quieres cancelar esta transacción?',
    noCancelIt: 'No, mantenerla',
    yesCancelIt: 'Sí, cancelarla',
    cancelledByUser: 'Cancelado por el usuario',
    cancelled: 'Cancelado',
    transactionCancelled: 'Transacción cancelada exitosamente',
    couldNotCancelTransaction: 'No se pudo cancelar la transacción',
    noPaymentID: 'Sin ID de Pago',
    paymentCreationFailed: 'La creación del pago falló. ¿Deseas cancelar esta transacción?',
    sessionExpired: 'Sesión expirada. Por favor inicia sesión de nuevo.',
    errorVerifying: 'Error al Verificar',
    couldNotVerifyPaymentStatus: 'No se pudo verificar el estado del pago',
    errorDetails: 'Detalles del Error',
    details: 'Detalles',
    unknownError: 'Error desconocido',
    noDetailsAvailable: 'No hay detalles disponibles',
    paymentConfirmed: 'Pago Confirmado',
    paymentConfirmedBalanceUpdated: '¡Tu pago ha sido confirmado y tu saldo ha sido actualizado!',
    paymentFailed: 'Pago Fallido',
    paymentFailedOrExpired: 'Tu pago ha {status}. Por favor intenta de nuevo.',
    paymentStatus: 'Estado del Pago',
    currentStatus: 'Estado actual: {status}',
    couldNotVerifyStatus: 'No se pudo verificar el estado',
    networkError: 'Error de Red',
    couldNotConnectToServer: 'No se pudo conectar al servidor. Por favor verifica tu conexión a internet.',
    loadingHistory: 'Cargando historial...',
    noTransactions: 'Sin Transacciones',
    noTransactionsYet: 'Aún no tienes transacciones',
    noPendingTransactions: 'No hay transacciones pendientes',
    noSuccessfulTransactions: 'No hay transacciones exitosas',
    noFailedTransactions: 'No hay transacciones fallidas',
    pay: 'Pagar',
    verify: 'Verificar',
    viewTechnicalDetails: 'Ver Detalles Técnicos',
    
    // Withdrawals (Retiros) Page
    withdraw: 'Retirar',
    retiros: 'Retiros',
    loadingData: 'Cargando datos...',
    mxiAvailable: 'MXI Disponible',
    totalMXI: 'MXI Total',
    approximateUSDT: 'USDT Aproximado',
    withdrawalType: 'Tipo de Retiro',
    withdrawMXIPurchased: 'Retirar MXI Comprado',
    mxiAcquiredThroughPurchases: 'MXI adquirido mediante compras',
    lockedUntilLaunch: 'Bloqueado hasta el lanzamiento',
    withdrawMXICommissions: 'Retirar MXI de Comisiones',
    mxiFromReferralCommissions: 'MXI de comisiones por referidos',
    available: 'Disponible',
    availableLabel: 'Disponible',
    withdrawMXIVesting: 'Retirar MXI de Vesting',
    mxiGeneratedByYield: 'MXI generado por rendimiento',
    realTime: 'Tiempo real',
    activeReferralsForVestingWithdrawals: '7 Referidos Activos para retiros de vesting ({{count}}/7)',
    withdrawMXITournaments: 'Retirar MXI de Torneos',
    mxiWonInTournamentsAndChallenges: 'MXI ganado en torneos y desafíos',
    withdrawalDetails: 'Detalles del Retiro',
    withdrawalsInUSDT: 'Los retiros se procesan en USDT',
    withdrawalsInUSDTETH: 'Retiros en USDT (Red Ethereum)',
    amountMXI: 'Cantidad (MXI)',
    amountInMXI: 'Cantidad en MXI',
    maximum: 'Máx',
    equivalentInUSDT: 'Equivalente en USDT',
    rate: 'Tasa',
    walletAddressETH: 'Dirección de Billetera (ETH)',
    enterYourETHWalletAddress: 'Ingresa tu dirección de billetera ETH',
    requestWithdrawal: 'Solicitar Retiro',
    withdrawalRequirements: 'Requisitos de Retiro',
    activeReferralsForGeneralWithdrawals2: '5 Referidos Activos para retiros generales ({{count}}/5)',
    mxiLaunchRequiredForPurchasedAndVesting: 'Lanzamiento de MXI requerido para retiros de Comprado y Vesting',
    importantInformation: 'Información Importante',
    withdrawalsInUSDTETHInfo: 'Los retiros se procesan en USDT en la red Ethereum',
    conversionInfo: 'Tasa de conversión: 1 MXI = 0.4 USDT',
    mxiCommissionsInfo: 'Las Comisiones MXI están disponibles inmediatamente con 5 referidos activos + KYC',
    mxiTournamentsInfo: 'Los Torneos MXI están disponibles con los mismos requisitos que las comisiones',
    mxiVestingInfo: 'El Vesting MXI requiere 7 referidos activos y el lanzamiento de MXI',
    mxiPurchasedInfo: 'El MXI Comprado está bloqueado hasta el lanzamiento oficial de MXI',
    mxiCommissionsAvailableImmediately: 'Las Comisiones MXI están disponibles inmediatamente con 5 referidos activos + KYC',
    mxiTournamentsAvailableSameAsCommissions: 'Los Torneos MXI están disponibles con los mismos requisitos que las comisiones',
    mxiVestingRequires7Referrals: 'El Vesting MXI requiere 7 referidos activos y el lanzamiento de MXI',
    mxiPurchasedLockedUntilLaunch: 'El MXI Comprado está bloqueado hasta el lanzamiento oficial de MXI',
    realTimeUpdateInfo: 'El saldo de vesting se actualiza en tiempo real cada segundo',
    processingTime: 'Tiempo de Procesamiento',
    processingTimeInfo: 'Los retiros se procesan en 24-48 horas',
    verifyWalletAddress: 'Verificar Dirección de Billetera',
    verifyWalletAddressInfo: 'Verifica tu dirección de billetera cuidadosamente antes de enviar',
    viewWithdrawalHistory2: 'Ver Historial de Retiros',
    invalidAmount: 'Cantidad Inválida',
    enterValidAmount: 'Por favor ingresa una cantidad válida',
    missingInformation: 'Información Faltante',
    enterWalletAddress: 'Por favor ingresa tu dirección de billetera',
    insufficientBalanceNeed: 'Necesitas {{needed}} MXI pero solo tienes {{available}} MXI disponibles',
    withdrawalNotAvailable: 'Retiro No Disponible',
    withdrawalsAvailableAfterLaunch: 'Los retiros de {{label}} estarán disponibles después del lanzamiento de MXI ({{days}} días restantes)',
    requirementNotMet: 'Requisito No Cumplido',
    vestingRequires7Referrals: 'Los retiros de vesting requieren 7 referidos activos. Actualmente tienes {{count}}.',
    understood: 'Entendido',
    notEligible: 'No Elegible',
    need5ActiveReferralsAndKYC: 'Necesitas 5 referidos activos y KYC aprobado para retirar comisiones y torneos',
    confirmWithdrawal: 'Confirmar Retiro',
    confirmWithdrawalMessage: '¿Estás seguro de que quieres retirar {{mxi}} MXI ({{label}})?\n\nRecibirás aproximadamente {{usdt}} USDT',
    requestSent: 'Solicitud Enviada',
    withdrawalRequestSent: '¡Solicitud de retiro enviada exitosamente!\n\n{{mxi}} MXI ({{label}}) → {{usdt}} USDT\n\nUn administrador procesará tu retiro en 24-48 horas.',
    errorProcessingWithdrawal: 'Error al procesar el retiro. Por favor intenta de nuevo.',
    mxiPurchasedText: 'MXI Comprado',
    mxiCommissionsText: 'MXI de Comisiones',
    mxiVestingText: 'MXI de Vesting',
    mxiTournamentsText: 'MXI de Torneos',
    
    // Withdrawal History
    withdrawalHistoryTitle: 'Historial de Retiros',
    noWithdrawalsYet: 'Aún no hay retiros',
    withdrawalHistoryWillAppear: 'Tu historial de retiros aparecerá aquí',
    walletAddressText: 'Dirección de Billetera',
    completedText: 'Completado',
    processing: 'Procesando',
    
    // Tournaments Page
    tournamentsTitle: 'Torneos',
    availableGames: 'Juegos Disponibles',
    distributionOfRewards: 'Distribución de Recompensas',
    winner: 'Ganador',
    prizeFund: 'Fondo de Premios',
    onlyUseCommissionsOrChallenges: 'Solo usa MXI de Comisiones o Desafíos para participar en torneos',
    waitingTournaments: 'Torneos en Espera',
    code: 'Código',
    players: 'Jugadores',
    prize: 'Premio',
    full: 'Lleno',
    createNewTournament: 'Crear Nuevo Torneo',
    tournamentLimitReached: 'Límite de Torneos Alcanzado',
    maxTournamentsReached: 'Se alcanzó el número máximo de torneos abiertos para este juego',
    joinTournament: 'Unirse al Torneo',
    entryFee: 'Cuota de Entrada',
    join: 'Unirse',
    create: 'Crear',
    joiningGame: 'Uniéndose al juego...',
    creatingTournament: 'Creando torneo...',
    selectPlayers: 'Seleccionar Jugadores',
    asFirstPlayerChoosePlayers: 'Como primer jugador, elige cuántos jugadores participarán en este torneo',
    createTournamentOf: 'Torneo de {{count}} Jugadores',
    participateFor: 'Participar por {{fee}} MXI',
    
    // Game Lobby
    invalidSession: 'Sesión inválida',
    sessionCancelled: 'Sesión Cancelada',
    sessionWasCancelled: 'La sesión fue cancelada',
    removedFromSession: 'Eliminado de la Sesión',
    youWereRemovedFromSession: 'Fuiste eliminado de la sesión',
    waitingForPlayers: 'Esperando Jugadores',
    leavingGameWarning: '¿Salir del Juego?',
    leavingGameWarningMessage: '¿Estás seguro de que quieres salir? Tu cuota de entrada será reembolsada.',
    
    // Risks Tab Content - NEW CONTENT
    risksIntro: 'Invertir en MXI representa una oportunidad innovadora dentro de un ecosistema diseñado para el crecimiento real, pero también implica riesgos perjudiciales que todo inversor debe considerar de manera responsable. MXI promueve la transparencia, por lo que detallamos los factores clave que pueden influir en la rentabilidad presente y futura del proyecto.',
    risk1Title: '1. Riesgo de Volatilidad del Mercado',
    risk1Description: 'El mercado cripto es altamente volátil. Aunque MXI integra un modelo tokenómico híbrido que busca estabilidad mediante vesting diario, mecanismos de liquidez y recompensas escalables, el precio puede fluctuar significativamente ante condiciones globales, sentimiento del mercado o eventos inesperados. El valor proyectado de lanzamiento (3 USDT) es una estimación, no una garantía.',
    risk2Title: '2. Riesgo Tecnológico',
    risk2Description: 'A pesar de que MXI incorpora seguridad cuántica post-cuántica y arquitectura avanzada, ningún ecosistema digital está completamente libre de vulnerabilidades. Fallos en protocolos, ataques externos o nuevas amenazas tecnológicas podrían afectar la operatividad. La implementación cuántica minimiza escenarios futuros, pero no elimina los riesgos al 100%.',
    risk3Title: '3. Riesgo de Ejecución del Proyecto',
    risk3Description: 'MXI está en fase de prevención y, como todo proyecto en desarrollo, depende de la correcta ejecución del plan técnico, los tiempos de implementación, la adopción comunitaria y la consolidación de alianzas estratégicas. Retrasos o reestructuraciones pueden impactar metas y proyecciones.',
    risk4Title: '4. Riesgo Regulatorio',
    risk4Description: 'El entorno normativo global respecto a criptoactivos es cambiante. Cambios en leyes de países clave, mayores exigencias de cumplimiento o restricciones a intercambios pueden influir en la liquidez, accesibilidad o precio del token.',
    risk5Title: '5. Riesgo de Liquidez',
    risk5Description: 'Aunque MXI integra un modelo de liquidez progresivo y herramientas que incentivan el holding (vesting diario, recompensas, referidos), en etapas iniciales la liquidez puede ser limitada. Esto podría dificultar ventas inmediatas al precio deseado.',
    risk6Title: '6. Riesgo de Adopción del Ecosistema',
    risk6Description: 'El potencial de MXI crece a medida que se fortalece la comunidad y aumenta el uso dentro del ecosistema (tarjeta, créditos, herramientas para emprendedores, Marketplaces, Launchpad, energía, expansión global, etc.). Una adopción más lenta podría prolongar los tiempos de apreciación del token.',
    risk7Title: '7. Riesgo Competitivo',
    risk7Description: 'MXI compite en un mercado donde existen proyectos altamente posicionados (BTC, ETH, SOL, ADA). Aunque el modelo híbrido, el vesting dinámico y la seguridad cuántica representan ventajas diferenciales, los avances de los competidores podrían afectar la cuota de mercado potencial.',
    risk8Title: '8. Riesgo de Dependencia Comunitaria',
    risk8Description: 'MXI se basa en un principio fundamental: si la comunidad crece, todos crecen. Esto significa que parte del éxito depende de la participación, compromiso y expansión de usuarios, emisores de proyectos, emprendedores e inversores. La baja participación limitaría las proyecciones globales.',
    risk9Title: '9. Riesgo de Inversión Temprana',
    risk9Description: 'Como en toda prevención, los inversores adquieren el token antes de que el ecosistema esté completamente desplegado. Aunque esto ofrece ventajas en precio (0.04 / 0.07 / 0.10 USDT), también conlleva la incertidumbre natural de las etapas iniciales.',
    
    // Additional translations for untranslated pages
    ambassadorButtonTitle: 'Embajadores MXI',
    ambassadorButtonSubtitle: 'Gana bonos por tus referidos',
    vestingAndPerformance: 'Vesting y Rendimiento',
    performanceProjected: 'Rendimiento Proyectado',
    phaseInfo: 'Fase {{phase}} • 1 MXI = ${{price}} USDT',
    perHour: 'Por Hora',
    per7Days: 'Por 7 Días',
    per1Month: 'Por 1 Mes (30 días)',
    untilLaunch: 'Hasta Lanzamiento',
    daysRemaining: '{{days}} días restantes',
    monthlyMaximum: 'Máximo Mensual (3%)',
    basedOnPurchased: 'Basado en {{amount}} MXI comprados',
    balanceBlocked: 'Saldo Bloqueado',
    vestingCannotBeWithdrawn: 'El saldo de vesting no se puede retirar hasta que se lance la moneda oficialmente.',
    monthlyYield: 'Rendimiento Mensual',
    calculationBase: 'Base de Cálculo',
    onlyPurchasedMXI: 'Solo MXI Comprado',
    update: 'Actualización',
    everySecond: 'Cada Segundo',
    currentPhaseLabel: 'Fase Actual',
    mxiPrice: 'Precio MXI',
    separateBalances: 'Saldos Separados (No generan vesting)',
    doesNotGenerateVesting: 'No genera rendimiento de vesting',
    monthlyProgress: 'Progreso Mensual (3% máx.)',
    nearMonthlyLimit: 'Cerca del límite mensual del 3%',
    accumulatedTotalYield: 'Rendimiento Acumulado Total',
    generatingPerSecondValue: 'Generando {{rate}} MXI por segundo',
    previousAccumulated: 'Acumulado Previo',
    noMXIInVesting: 'No hay MXI en vesting. Solo los MXI comprados directamente generan rendimiento de vesting.',
    miningRate: 'Tasa de minería: 0.005% por hora de tu MXI comprado. Solo el MXI comprado directamente genera rendimiento de vesting. Las comisiones NO generan vesting. Para reclamar tu MXI minado, necesitas 5 referidos activos, 10 días de membresía y aprobación KYC. Recordar que para vesting se deben tener 10 referidos activos y se desbloqueará una vez se lance el token y se liste en los exchanges.',
    shareReferralCodeMessage: 'Únete al Pool MXI con mi código de referido: {{code}}\n\n¡Gana tokens MXI y obtén recompensas!',
    copiedToClipboard: '¡Código de referido copiado al portapapeles!',
    yourReferrals: 'Tus Referidos',
    totalEarned: 'Total Ganado',
    allCommissionsInMXI: 'Todas las comisiones se manejan internamente en MXI',
    withdrawToMXIBalance: 'Retirar a Balance MXI',
    transferCommissionsToMainBalance: 'Transfiere tus comisiones a tu balance principal de MXI para usarlas en compras y otras funciones.',
    withdrawToBalance: 'Retirar a Balance',
    amountToWithdraw: 'Monto a Retirar (MXI)',
    minimum50MXI: 'Mínimo 50 MXI',
    availableAmount: 'Disponible: {{amount}} MXI',
    requirements: 'Requisitos:',
    activeReferrals5: '5 referidos activos ({{count}}/5)',
    minimum50MXIRequired: 'Mínimo 50 MXI',
    shareYourReferralCode: 'Comparte tu código de referido con amigos',
    howReferralsWork: 'Cómo Funcionan los Referidos',
    earn5PercentMXILevel1: 'Gana 5% en MXI de referidos de Nivel 1',
    earn2PercentMXILevel2: 'Gana 2% en MXI de referidos de Nivel 2',
    earn1PercentMXILevel3: 'Gana 1% en MXI de referidos de Nivel 3',
    activeReferralsNote: '* Referidos activos son aquellos que han realizado al menos una compra de 50 USDT o más',
    invalidAmount: 'Monto Inválido',
    pleaseEnterValidAmount: 'Por favor ingresa un monto válido',
    insufficientBalanceOnly: 'Solo tienes {{available}} MXI disponibles de comisiones',
    requirementsNotMetTitle: 'Requisitos No Cumplidos',
    need5ActiveReferralsMessage: 'Necesitas 5 referidos activos que hayan comprado el mínimo de MXI.\n\nActualmente tienes: {{count}} referidos activos',
    confirmWithdrawToBalance: 'Confirmar Retiro a Balance MXI',
    confirmWithdrawToBalanceMessage: '¿Deseas transferir {{amount}} MXI de comisiones a tu balance principal?\n\nEsto te permitirá usar estos MXI para compras y otras funciones.',
    withdrawalSuccessful: 'Retiro Exitoso',
    transferredToMainBalance: 'Se han transferido {{amount}} MXI a tu balance principal',
    failedToCompleteWithdrawal: 'No se pudo completar el retiro',
    unexpectedError: 'Ocurrió un error inesperado',
    networkTRC20: 'Los retiros se procesarán en USDT por la red TRC20 (Tron)',
    walletAddressTRC20: 'Dirección de Billetera USDT (TRC20)',
    enterTRC20WalletAddress: 'Ingresa tu dirección de billetera USDT TRC20 (Tron)',
    activeReferrals7Required: '7 Referidos Activos requeridos ({{count}}/7)',
    activeReferralsGeneral5: '5 Referidos Activos para retiros generales ({{count}}/5)',
    activeReferralsVesting7: '7 Referidos Activos para retiros de vesting ({{count}}/7)',
    vestingGenerates3Percent: 'El vesting genera un 3% mensual solo sobre MXI comprado directamente',
    verifyWalletAddressCarefully: 'Verifica que tu dirección de billetera sea correcta y compatible con la red TRC20 (Tron)',
    loadingAmbassadorData: 'Cargando datos de embajador...',
    thisMayTakeFewSeconds: 'Esto puede tomar unos segundos',
    couldNotLoadInformation: 'No se pudo cargar la información',
    pleaseTryAgain: 'Por favor, intenta de nuevo',
    retry: 'Reintentar',
    goBack: 'Volver',
    yourCurrentLevelTitle: 'Tu Nivel Actual',
    levelRequirement: 'Requisito: {{amount}} USDT',
    notAchievedAnyLevel: 'Aún no has alcanzado ningún nivel',
    needValidPurchases: 'Necesitas {{amount}} USDT en compras válidas de referidos de Nivel 1',
    validPurchasesAccumulated: 'Compras Válidas Acumuladas',
    progressToNextLevelTitle: 'Progreso al Siguiente Nivel',
    nextLevel: 'Siguiente Nivel',
    withdrawn: 'Retirado',
    requirementsMustBeMet: 'Tener el nivel alcanzado completamente',
    mustHaveKYCApproved: 'Debe tener KYC aprobado',
    mustHavePersonalPurchase: 'Debe tener mínimo 1 compra personal',
    withdrawalMethodTRC20: 'Método de retiro: USDT TRC20 solamente',
    bonusesAdditionalToCommission: 'Los bonos son adicionales al 5% de comisión por referidos',
    allBonusesCumulative: 'Todos los bonos son acumulativos',
    onlyLevel1Purchases: 'Solo cuentan compras de referidos directos (Nivel 1)',
    minimumPerPurchase: 'Monto mínimo por compra: 50 USDT',
    onlyPresalePurchases: 'Solo compras en preventa pagadas en USDT',
    adminWillProcess: 'El administrador procesará tu retiro en 24-48 horas',
    updatedAt: 'Actualizado: {{time}}',
    showingCachedData: 'Mostrando datos en caché, actualizando...',
    showingCachedDataError: 'Mostrando datos en caché (error al actualizar)',
    showingCachedDataOnly: 'Mostrando datos en caché',
    loadingFundraisingData: 'Cargando datos de recaudación...',
    updated: 'Actualizado',
    totalRaised: 'Total Recaudado',
    mxiBreakdown: 'Desglose de MXI',
    purchases: 'Compras',
    challenges: 'Desafíos',
    totalFundraisingProject: 'Recaudación Total del Proyecto',
    presaleProgress: 'Progreso de la preventa MXI',
    presaleStartDate: 'Inicio de Preventa',
    presaleEndDate: 'Finalización de Preventa',
    fundraisingBreakdown: 'Desglose de Recaudación',
    purchasedMXI: 'MXI Comprados',
    totalMXISold: 'Total de MXI vendidos (incluye pagos de usuarios y ventas manuales)',
    transactions: 'transacciones',
    transaction: 'transacción',
    generalProgressLabel: 'Progreso General',
    mxiDistributionBreakdown: 'Desglose de MXI Entregado',
    directPurchases: 'Compras Directas',
    mxiAcquiredViaUSDT: 'MXI adquirido mediante pagos en USDT. Los usuarios reciben MXI según el precio de la fase actual.',
    ofTotal: 'del total',
    referralCommissions: 'Comisiones de Referidos',
    mxiGeneratedByReferrals: 'MXI generado por el sistema de referidos (3% nivel 1, 2% nivel 2, 1% nivel 3). Se calcula automáticamente cuando los referidos realizan compras.',
    challengesAndTournaments: 'Desafíos y Torneos',
    mxiWonInTournamentsDesc: 'MXI ganado en torneos y desafíos. Requiere 5 referidos activos para poder retirar.',
    vestingLocked: 'Vesting (Bloqueado)',
    mxiGeneratedByVestingSystem: 'MXI generado por el sistema de vesting/yield. Bloqueado hasta la fecha de lanzamiento oficial de MXI.',
    commissionsAndPrizesGenerated: 'Las comisiones, premios y vesting se generan como incentivos adicionales del ecosistema MXI.',
    thisMetricShowsProgress: 'Esta métrica muestra el progreso total de la recaudación del proyecto MXI. Incluye todas las compras de MXI confirmadas. El objetivo máximo es de 17,500,000 USDT para el desarrollo completo del ecosistema (3 fases de preventa).',
    lastUpdate: 'Última actualización: {{time}} (Refresh #{{count}})',
    fundraisingMilestones: 'Hitos de Recaudación',
    phase1Milestone: 'Fase 1 - 3.33M USDT (0.40 USDT/MXI)',
    phase2Milestone: 'Fase 2 - 9.17M USDT (0.70 USDT/MXI)',
    phase3Milestone: 'Fase 3 - 17.5M USDT (1.00 USDT/MXI)',
    backToHome: 'Volver al Inicio',
    adminDashboard: 'Panel de Administración',
    welcomeAdmin: 'Bienvenido, {{name}}',
    dangerZone: 'ZONA DE PELIGRO',
    dangerZoneDescription: 'Reinicia todos los contadores de MXI a 0 (INCLUYENDO EL ADMINISTRADOR). Las relaciones de referidos se preservarán. Esta acción es IRREVERSIBLE.',
    resetAll: 'Reiniciar Todo',
    presaleMetrics: 'Métricas de Preventa',
    totalSold: 'Total Vendido',
    totalMembers: 'Total Miembros',
    progress: 'Progreso',
    users: 'Usuarios',
    active: 'Activo',
    totalUSDT: 'Total USDT',
    totalMXI: 'Total MXI',
    quickActions: 'Acciones Rápidas',
    manualVerifications: 'Verificaciones Manuales',
    advancedManagement: 'Gestión Avanzada',
    creditManualPayment: 'Acreditar Pago Manual',
    approveKYC: 'Aprobar KYC',
    withdrawals: 'Retiros',
    supportMessages: 'Mensajes Soporte',
    basicUsers: 'Usuarios Básico',
    vestingAnalytics: 'Vesting Analytics',
    deleteAccounts: 'Eliminar Cuentas',
    ambassadorBonuses: 'Bonos Embajadores',
    resetSystemTitle: '¿Reiniciar Todo el Sistema?',
    resetSystemMessage: 'Esta acción es IRREVERSIBLE y reiniciará todos los contadores a 0 (INCLUYENDO EL ADMINISTRADOR):',
    allBalancesReset: 'Todos los saldos MXI y USDT se pondrán en 0 (incluyendo admin)',
    allCommissionsDeleted: 'Se eliminarán todas las comisiones',
    allContributionsDeleted: 'Se eliminarán todas las contribuciones',
    allWithdrawalsDeleted: 'Se eliminarán todos los retiros',
    allPaymentsDeleted: 'Se eliminarán todos los pagos y órdenes',
    presaleMetricsReset: 'Las métricas de preventa se reiniciarán a 0',
    allVestingDeleted: 'Todo el vesting se eliminará',
    adminBalanceReset: 'El balance del administrador también se reiniciará a 0',
    referralRelationsPreserved: 'Las relaciones de referidos SE PRESERVARÁN',
    typeResetToConfirm: 'Escribe "RESETEAR" para confirmar:',
    confirmReset: 'Confirmar Reset',
    mustTypeReset: 'Debes escribir "RESETEAR" para confirmar',
    systemReset: 'Sistema Reiniciado',
    systemResetSuccess: 'La página se recargará para actualizar los datos.',
    updateComplete: 'Actualización Completa',
    allDataUpdated: 'Todos los datos han sido actualizados. El balance del administrador ahora es 0.',
    resetError: 'Error al reiniciar el sistema',
    accessDenied: 'Acceso Denegado',
    noAdminPermissions: 'No tienes permisos de administrador',
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
    copied2: '✅ Copiado',
    or: 'ou',
    and: 'e',
    total: 'Total',
    continue: 'Continuar',
    send: 'Enviar',
    request: 'Solicitar',
    sendRequest: 'Enviar Solicitação',
    respond: 'Responder',
    pending: 'Pendente',
    selectLanguage: 'Selecionar Idioma',
    date: 'Data',
    currency: 'Moeda',
    network: 'Rede',
    order: 'Pedido',
    paymentID: 'ID de Pagamento',
    transactionHash: 'Hash de Transação',
    
    // Tab Navigation
    tabHome: 'Início',
    tabDeposit: 'Depósito',
    tabWithdraw: 'Retirar',
    tabReferrals: 'Referências',
    tabTournaments: 'Torneios',
    tabRewards: 'Recompensas',
    tabEcosystem: 'Ecossistema',
    tabProfile: 'Perfil',
    
    // Admin Panel - User Management
    userManagement: 'Gestão de Usuários',
    searchPlaceholder: 'Buscar por nome, email, ID...',
    loadingUsers: 'Carregando usuários...',
    all: 'Todos',
    actives: 'Ativos',
    inactive: 'Inativos',
    blocked: 'Bloqueados',
    noUsersFound: 'Nenhum usuário encontrado',
    adjustSearchFilters: 'Ajuste sua busca ou filtros',
    refs: 'refs',
    joined: 'Entrou',
    userDetails: 'Detalhes do Usuário',
    blockUser: 'Bloquear Usuário',
    blockUserConfirm: 'Tem certeza de que deseja bloquear este usuário?',
    block: 'Bloquear',
    blockedByAdmin: 'Bloqueado pelo administrador',
    userBlockedSuccess: 'Usuário bloqueado com sucesso',
    errorBlockingUser: 'Erro ao bloquear usuário',
    unblockUser: 'Desbloquear Usuário',
    unblockUserConfirm: 'Tem certeza de que deseja desbloquear este usuário?',
    unblock: 'Desbloquear',
    userUnblockedSuccess: 'Usuário desbloqueado com sucesso',
    errorUnblockingUser: 'Erro ao desbloquear usuário',
    failedToLoadSettings: 'Falha ao carregar configurações',
    
    // Profile Screen
    profile: 'Perfil',
    totalBalance: 'Saldo Total',
    mxiPurchased: 'MXI Comprado',
    mxiPurchasedLabel: 'Comprado',
    mxiCommissionsLabel: 'Comissões',
    mxiVestingLabel: 'Vesting',
    mxiTournamentsLabel: 'Torneios',
    adminPanel: 'Painel de Administração',
    manageUsers: 'Gerenciar usuários e sistema',
    memberSince: 'Membro desde',
    mxiCommissions: 'Comissões MXI',
    rejected: 'Rejeitado',
    areYouSureLogout: 'Tem certeza de que deseja sair?',
    approved: 'Aprovado',
    notSubmitted: 'Não Enviado',
    editProfile: 'Editar Perfil',
    updateYourInfo: 'Atualize suas informações',
    kycVerification: 'Verificação KYC',
    viewYieldGeneration: 'Ver geração de rendimento',
    withdrawalHistory: 'Histórico de Retiradas',
    viewPreviousWithdrawals: 'Ver retiradas anteriores',
    challengeHistory: 'Histórico de Desafios',
    viewGameRecords: 'Ver registros de jogos',
    getHelp: 'Obter ajuda',
    vestingAndYield: 'Vesting e Rendimento',
    
    // Edit Profile Screen
    editProfileText: 'Editar Perfil',
    profileLockedText: 'Perfil Bloqueado',
    profileCannotBeEditedText: 'Seu perfil não pode ser editado enquanto seu status KYC é {{status}}.',
    profileInfoCanOnlyBeModifiedText: 'As informações do perfil só podem ser modificadas antes de enviar a verificação KYC ou após a rejeição.',
    backToProfileText: 'Voltar ao Perfil',
    importantNoticeText: 'Aviso Importante',
    canOnlyEditBeforeKYCText: 'Você só pode editar as informações do seu perfil antes de enviar a verificação KYC ou se seu KYC foi rejeitado.',
    personalInformationText: 'Informações Pessoais',
    fullNameText: 'Nome Completo',
    enterYourFullNameText: 'Digite seu nome completo',
    enterFullLegalNameText: 'Digite seu nome legal completo como aparece em sua identificação',
    idNumberText: 'Número de Identificação',
    enterYourIDNumberText: 'Digite seu número de identificação',
    enterNationalIDText: 'Digite seu número de identificação nacional ou passaporte',
    residentialAddressText: 'Endereço Residencial',
    enterYourResidentialAddressText: 'Digite seu endereço residencial',
    enterCompleteAddressText: 'Digite seu endereço residencial completo',
    emailAndReferralCannotChangeText: 'O email e o código de referência não podem ser alterados',
    emailAddressReadOnlyText: 'Endereço de Email (Somente leitura)',
    referralCodeReadOnlyText: 'Código de Referência (Somente leitura)',
    saveChangesText: 'Salvar Alterações',
    pleaseEnterFullNameText2: 'Por favor, digite seu nome completo',
    pleaseEnterAddressText: 'Por favor, digite seu endereço',
    pleaseEnterIDNumberText: 'Por favor, digite seu número de identificação',
    idNumberAlreadyRegisteredText: 'Este número de identificação já está registrado por outro usuário',
    successText2: 'Sucesso',
    profileUpdatedSuccessfullyText: 'Perfil atualizado com sucesso',
    failedToUpdateProfileText: 'Falha ao atualizar o perfil. Por favor, tente novamente.',
    
    // KYC Verification Screen
    completeYourKYCVerification: 'Complete sua verificação KYC',
    loadingKYCData: 'Carregando dados de KYC...',
    verificationStatus: 'Status de Verificação',
    verifiedOn: 'Verificado em',
    yourKYCIsBeingReviewed: 'Sua verificação KYC está sendo revisada por nossa equipe. Isso geralmente leva 24-48 horas.',
    rejectionReason: 'Motivo da Rejeição',
    pleaseCorrectIssues: 'Por favor, corrija os problemas e reenvie sua verificação.',
    whyKYCRequired: 'Por que o KYC é necessário?',
    kycMandatoryForWithdrawals: 'KYC é obrigatório para retiradas',
    helpPreventFraud: 'Ajuda a prevenir fraude e lavagem de dinheiro',
    ensureCompliance: 'Garante conformidade com regulamentações',
    protectYourAccount: 'Protege sua conta e fundos',
    oneTimeVerification: 'Processo de verificação único',
    personalInformation: 'Informações Pessoais',
    fullLegalName: 'Nome Legal Completo',
    enterFullNameAsOnID: 'Digite seu nome completo como aparece em sua identificação',
    documentType: 'Tipo de Documento',
    nationalID: 'Identificação Nacional',
    passport: 'Passaporte',
    driversLicense: 'Carteira de Motorista',
    documentNumber: 'Número do Documento',
    enterYourDocumentNumber: 'Digite seu número de documento',
    frontDocument: 'Frente do Documento',
    uploadClearPhotoOfFront: 'Envie uma foto clara da frente do seu documento',
    uploading: 'Enviando...',
    tapToChange: 'Toque para alterar',
    tapToUploadFront: 'Toque para enviar a frente',
    backDocument: 'Verso do Documento',
    uploadClearPhotoOfBack: 'Envie uma foto clara do verso do seu documento',
    tapToUploadBack: 'Toque para enviar o verso',
    submitting: 'Enviando...',
    submitKYCVerification: 'Enviar Verificação KYC',
    yourDataIsSecure: 'Seus Dados estão Seguros',
    dataEncryptedAndSecure: 'Todos os seus dados são criptografados e armazenados com segurança. Nunca compartilhamos suas informações com terceiros.',
    kycVerified: 'KYC Verificado',
    identityVerifiedSuccessfully: 'Sua identidade foi verificada com sucesso. Agora você pode fazer retiradas.',
    loadingUserData: 'Carregando dados do usuário...',
    pleaseEnterFullNameText: 'Por favor, digite seu nome completo',
    pleaseEnterDocumentNumber: 'Por favor, digite seu número de documento',
    pleaseUploadFrontDocument: 'Por favor, envie a frente do seu documento',
    pleaseUploadBackDocument: 'Por favor, envie o verso do seu documento',
    authenticationErrorText: 'Erro de autenticação. Por favor, faça login novamente.',
    errorSubmittingKYC: 'Erro ao enviar a verificação KYC. Por favor, tente novamente.',
    kycSubmittedSuccessfully: 'KYC Enviado com Sucesso',
    kycUnderReview: 'Sua verificação KYC foi enviada e está sob revisão. Você será notificado assim que for aprovada.',
    submissionError: 'Erro de Envio',
    errorUploadingDocument: 'Erro ao enviar o documento. Por favor, tente novamente.',
    successUploadDocument: 'Envio Bem-sucedido',
    frontDocumentUploaded: 'Documento frontal enviado com sucesso',
    backDocumentUploaded: 'Documento traseiro enviado com sucesso',
    uploadError: 'Erro de Envio',
    
    // Support Screen
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
    describeIssueInDetailText: 'Descreva seu problema em detalhes',
    sendMessageButtonText: 'Enviar Mensagem',
    messageSentSuccessText: 'Sua mensagem foi enviada com sucesso. Nossa equipe responderá em 24-48 horas.',
    failedToSendMessageErrorText: 'Falha ao enviar mensagem. Por favor, tente novamente.',
    noMessagesYetTitleText: 'Ainda Não Há Mensagens',
    createSupportRequestMessageText: 'Crie uma solicitação de suporte para obter ajuda de nossa equipe',
    messageDetail: 'Detalhe da Mensagem',
    messageDetailComingSoonText: 'Visualização de detalhes da mensagem em breve',
    repliesCountText: 'respostas',
    failedToLoadMessages: 'Falha ao carregar mensagens',
    pleaseEnterSubjectAndMessageText: 'Por favor, digite tanto o assunto quanto a mensagem',
    
    // Other common translations
    login: 'Entrar',
    logout: 'Sair',
    email: 'Email',
    password: 'Senha',
    register: 'Registrar',
    deposit: 'Depósito',
    withdraw: 'Retirar',
    rewards: 'Recompensas',
    ecosystem: 'Ecossistema',
    support: 'Suporte',
    
    // Auth - Login Screen
    loginButton: 'Entrar',
    emailLabel: 'Email',
    passwordLabel: 'Senha',
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
    forgotPassword: 'Esqueceu sua senha?',
    rememberPassword: 'Lembrar senha',
    enterYourEmail: 'seu@email.com',
    enterYourPassword: 'Digite sua senha',
    fillAllFields: 'Por favor, preencha todos os campos',
    emailVerificationRequired: 'Verificação de Email Necessária',
    pleaseVerifyEmail: 'Por favor, verifique seu email antes de fazer login. Verifique sua caixa de entrada para o link de verificação.',
    resendEmail: 'Reenviar Email',
    loginError: 'Erro de Login',
    invalidCredentials: 'Email ou senha inválidos. Por favor, tente novamente.',
    errorLoggingIn: 'Erro ao fazer login. Por favor, tente novamente.',
    emailVerificationSent: 'Email de verificação enviado! Por favor, verifique sua caixa de entrada.',
    errorResendingEmail: 'Erro ao reenviar email de verificação. Por favor, tente novamente.',
    recoverPasswordTitle: 'Recuperar Senha',
    recoverPasswordMessage: 'Para recuperar sua senha, por favor, entre em contato com nossa equipe de suporte.',
    contactSupport: 'Contatar Suporte',
    sendEmailTo: 'Envie um email para:',
    supportEmail: 'suporte@maxcoin.com',
    mxiStrategicPresale: 'Pré-venda Estratégica MXI',
    secureYourPosition: 'Garanta sua posição no futuro',
    viewTerms: 'Ver Termos e Condições',
    termsAndConditions: 'Termos e Condições',
    presaleClosesOn: 'A pré-venda fecha em 15 de fevereiro de 2026 às 12:00 UTC',
    pleaseVerifyEmailBeforeLogin: 'Por favor, verifique seu email antes de fazer login',
    resendEmailButton: 'Reenviar Email',
    
    // Register Screen
    joinMXIStrategicPresale: 'Junte-se à Pré-venda Estratégica MXI',
    fullName: 'Nome Completo',
    enterYourFullName: 'Digite seu nome completo',
    enterYourIDNumber: 'Digite seu número de identificação',
    enterYourResidentialAddress: 'Digite seu endereço residencial',
    minimumSixCharacters: 'Mínimo 6 caracteres',
    reEnterPassword: 'Digite novamente sua senha',
    enterReferralCode: 'Digite o código de referência (opcional)',
    onlyOneAccountPerPerson: 'Apenas uma conta por pessoa. Contas múltiplas serão suspensas.',
    iHaveReadAndAccept: 'Li e aceito os',
    alreadyHaveAccountLogin: 'Já tem uma conta?',
    acceptTermsButton: 'Aceitar Termos',
    termsAndConditionsRequired: 'Termos e Condições Necessários',
    youMustAcceptTerms: 'Você deve aceitar os Termos e Condições para continuar',
    passwordsDontMatch: 'As senhas não coincidem',
    passwordTooShort: 'A senha deve ter pelo menos 6 caracteres',
    invalidEmail: 'Por favor, digite um endereço de email válido',
    accountCreatedSuccessfully: '✅ Conta criada com sucesso! Por favor, verifique seu email antes de fazer login.',
    failedToCreateAccount: 'Falha ao criar conta. Por favor, tente novamente.',
    termsContent: `TERMOS E CONDIÇÕES DE USO

MXI STRATEGIC PRESALE – APP VERSION

MAXCOIN (MXI) é uma marca registrada da MXI Strategic Holdings Ltd., Ilhas Cayman.
App operado pela MXI Technologies Inc. (Panamá).
Última atualização: 15/01/2026 – Versão 1.1

1. Aceitação

Ao criar uma conta ou usar o aplicativo MXI Strategic Presale (o "App"), você aceita estes Termos e Condições.
Se você não concordar com eles, não deve usar o App.

2. Sobre MXI

MXI Strategic Holdings Ltd. (Cayman) é a entidade proprietária do token MXI, da marca e da propriedade intelectual.

MXI Technologies Inc. (Panamá) é a empresa operadora do App e responsável por seu funcionamento.

3. Função do App

O App permite:

- Registrar usuários
- Comprar tokens MXI com USDT (via CRIPTOMOEDA)
- Acessar um sistema de referências
- Ver saldos, rendimentos e movimentos
- Solicitar retiradas de comissões e/ou MXI de acordo com as regras vigentes

4. Elegibilidade

Para usar o App, você deve:

- Ter mais de 18 anos
- Ter capacidade legal para contratar
- Fornecer dados verdadeiros
- Não viver em países onde as criptomoedas são proibidas

5. Registro e Conta

- Apenas uma conta por pessoa é permitida
- É obrigatório completar KYC para habilitar retiradas
- As informações registradas devem corresponder aos documentos oficiais
- Os números de identificação não podem ser repetidos

6. Compra de Tokens MXI

- Compra mínima: 50 USDT
- Máximo por usuário: 100.000 USDT
- Pagamento exclusivamente em USDT através de CRIPTOMOEDA
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
- Informações verificáveis

11. Riscos

Investir em criptomoedas envolve riscos:

- Volatilidade extrema
- Perda total ou parcial do capital
- Mudanças regulatórias
- Riscos tecnológicos e de cibersegurança

MXI Strategic não garante lucros ou retornos fixos.

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

Qualquer valor futuro, convertibilidade ou listagem do token dependerá de condições externas à empresa, processos regulatórios e decisões de mercado que não podem ser garantidas. A plataforma não garante benefícios econômicos, apreciação ou qualquer retorno associado ao MXI.

16. ANEXO LEGAL – JOGOS E RECOMPENSAS MXI

As dinâmicas disponíveis dentro da plataforma (incluindo desafios, mini-jogos como tap, clicker, "AirBall", desafios de habilidade e a modalidade "Bonus MXI") são baseadas exclusivamente na habilidade, velocidade, precisão ou participação ativa do usuário, e não dependem do acaso para determinar resultados.

Nenhuma atividade oferecida deve ser interpretada como:

- jogo de azar,
- aposta,
- sorteio com fins lucrativos,
- rifas reguladas,
- loterias estatais ou privadas,
- nem mecanismos equivalentes regulados na Colômbia, Espanha ou México.

O acesso a essas dinâmicas pode exigir um pagamento simbólico em MXI, mas tal pagamento não constitui uma aposta, já que o token não possui valor econômico real e é usado apenas como mecanismo interno de participação.

A modalidade "Bonus MXI", incluindo alocação aleatória de prêmios, é realizada fora da plataforma principal, através de processos independentes, transparentes e verificáveis, cujo objetivo é distribuir recompensas promocionais em MXI sem que isso constitua um jogo de azar regulado.

Os usuários aceitam que as recompensas concedidas são promocionais, digitais e sem valor comercial, e que a participação em qualquer dinâmica não garante ganhos econômicos reais.

---

**IMPORTANTE**: Estes termos e condições são legalmente vinculativos. Se você não concordar com qualquer parte, não deve usar o Aplicativo. É recomendável consultar um consultor legal ou financeiro antes de fazer investimentos em criptomoedas.

**Data de vigência**: 15 de Janeiro de 2026
**Versão**: 1.1`,
    privacyPolicy: 'Política de Privacidade',
    viewPrivacyPolicy: 'Ver Política de Privacidade',
    privacyPolicyContent: `POLÍTICA DE PRIVACIDADE

Esta Política de Privacidade descreve como a MXI Technologies Inc. ("MXI", "nós") coleta, usa e protege os dados pessoais dos usuários que usam o App MXI Strategic Presale ("o App"). Ao se registrar ou usar o App, você aceita esta Política.

1. Dados que coletamos

Coletamos as informações necessárias para o funcionamento seguro do App, incluindo:

- Nome completo
- Documento de identidade
- Data de nascimento
- Email
- Número de telefone
- Dados de sessão e atividade no App
- Carteira USDT fornecida pelo usuário
- Informações capturadas durante o processo KYC (foto do documento, selfie, verificação biométrica)

Não coletamos dados que não sejam necessários para a operação do serviço.

2. Uso das informações

Usamos seus dados para:

- Criar e gerenciar sua conta
- Verificar identidade (KYC)
- Permitir compras de MXI na fase de desenvolvimento
- Gerenciar o sistema de referências
- Processar solicitações de retirada
- Melhorar a segurança e prevenir fraude
- Enviar notificações relacionadas à sua conta ou mudanças no App

Seus dados não são vendidos ou trocados com terceiros.

3. Bases legais

O tratamento é baseado em:

- Seu consentimento ao se registrar
- Cumprimento de obrigações de verificação (KYC/AML)
- Prevenção de fraude
- Execução do serviço contratado

4. Armazenamento e proteção

MXI adota medidas técnicas e administrativas para proteger as informações, incluindo:

- Criptografia
- Acesso restrito
- Controles antifraude
- Servidores seguros

Nenhum sistema é completamente invulnerável, mas aplicamos boas práticas internacionais de segurança.

5. Compartilhamento de dados

Podemos compartilhar dados apenas com:

- Provedores de verificação KYC
- Serviços de análise ou segurança
- Autoridades competentes se exigido por lei

Não compartilhamos dados com terceiros para fins comerciais.

6. Retenção de dados

Retemos seus dados enquanto sua conta estiver ativa e pelo tempo necessário para:

- Cumprir obrigações legais
- Resolver disputas
- Prevenir atividades fraudulentas

Você pode solicitar a exclusão de sua conta, exceto quando houver obrigações regulatórias pendentes.

7. Direitos do usuário

Você pode:

- Acessar seus dados
- Retificá-los
- Atualizá-los
- Solicitar exclusão
- Retirar seu consentimento
- Limitar o tratamento

Para exercer esses direitos, você pode nos contatar via suporte dentro do App.

8. Transferências internacionais

Seus dados podem ser processados em países com leis de proteção diferentes das suas. Ao usar o App, você autoriza tais transferências, sempre sob medidas de segurança adequadas.

9. Menores de idade

O uso do App é restrito a pessoas maiores de 18 anos. Excluiremos qualquer conta criada por menores.

10. Mudanças nesta Política

Podemos atualizar esta Política a qualquer momento. A versão atual estará disponível dentro do App. O uso continuado implica aceitação das mudanças.

11. Contato

Para consultas ou solicitações relacionadas à privacidade, você pode nos contatar através do suporte oficial do App.

Versão 1.1 – Vigente desde 15/01/2026.`,
    
    // Ecosystem Screen
    liquidityPool: 'Pool de Liquidez',
    whatIsMXI: 'O que é MXI?',
    howItWorksTab: 'Como Funciona',
    whyBuy: 'Por Que Comprar',
    meta: 'Meta',
    ecosystemTab: 'Ecossistema',
    quantumSecurity: 'Segurança Quântica',
    sustainability: 'Sustentabilidade',
    dailyVesting: 'Vesting Diário',
    inPractice: 'Na Prática',
    tokenomics: 'Tokenômica',
    risks: 'Riscos',
    
    // Ecosystem Tab Content - NEW CONTENT
    ecosystemTabTitle: 'Ecossistema MXI',
    ecosystemIntro: '🌐 MXI é um ecossistema, não é apenas um token: é uma infraestrutura completa projetada para operar como uma economia digital autossustentável, capaz de integrar produtos, serviços, tecnologia e comunidade dentro do mesmo ambiente interconectado. Cada elemento é projetado para alimentar os outros, gerando fluxo, utilidade e crescimento real tanto para usuários, empreendedores e investidores.',
    ecosystemApproach: '🚀 Nossa abordagem transforma MXI em um ambiente vivo, escalável e funcional, onde todas as soluções se conectam para criar valor contínuo e descentralizado.',
    ecosystemComponentsTitle: 'Componentes do Ecossistema MXI',
    ecosystemComponentsSubtitle: 'A seguir, são enumerados e explicados os pilares que fazem de MXI um verdadeiro ecossistema:',
    ecosystemComponent1Title: '1. 💎 Token MXI (núcleo do ecossistema)',
    ecosystemComponent1Desc: 'O token é a base sobre a qual toda a economia MXI é construída: transações, recompensas, votações, pagamentos, governança e acesso a serviços.',
    ecosystemComponent2Title: '2. 🔐 MXI Wallet Multicamada',
    ecosystemComponent2Desc: 'Carteira inteligente com arquitetura de segurança quântica, preparada para ameaças futuras e focada em proteger ativos, identidades e transações.',
    ecosystemComponent3Title: '3. 💰 Plataforma DeFi MXI',
    ecosystemComponent3Desc: 'Inclui:',
    ecosystemComponent3Point1: '- Staking e recompensas automatizadas',
    ecosystemComponent3Point2: '- Pools de liquidez',
    ecosystemComponent3Point3: '- Empréstimos descentralizados para empreendedores',
    ecosystemComponent3Point4: '- Mecanismos de rendimento sustentáveis',
    ecosystemComponent4Title: '4. 🚀 MXI Launchpad para empreendedores',
    ecosystemComponent4Desc: 'Espaço para que novos projetos recebam financiamento dentro do ecossistema usando MXI, impulsionando a economia real e a inovação.',
    ecosystemComponent5Title: '5. 💳 MXI Pay & Cartão MXI',
    ecosystemComponent5Desc: 'Um cartão interoperável que permite usar MXI em comerciantes, pagamentos diários, compras globais e retiradas. Projetado para integrar finanças digitais e vida cotidiana.',
    ecosystemComponent6Title: '6. 🛡️ Sistema de Segurança Quântica',
    ecosystemComponent6Desc: 'Nossa infraestrutura adota algoritmos resistentes à computação quântica, antecipando os desafios tecnológicos da próxima década.',
    ecosystemComponent7Title: '7. 🌍 Marketplace e Integrações Web3',
    ecosystemComponent7Desc: 'Projetos, serviços, produtos e utilidades que usam MXI como meio de pagamento e troca, fortalecendo a circulação de valor.',
    ecosystemComponent8Title: '8. 🗳️ Programa de Governança Comunitária',
    ecosystemComponent8Desc: 'A comunidade vota, propõe e decide o rumo do ecossistema. Se MXI cresce, todos ganham.',
    ecosystemComponent9Title: '9. 📚 MXI Academy (formação & comunidade)',
    ecosystemComponent9Desc: 'Educação financeira, blockchain e desenvolvimento de projetos para empoderar empreendedores e investidores.',
    ecosystemSummaryTitle: 'Resumo',
    ecosystemSummaryIntro: 'MXI é um ecossistema porque integra:',
    ecosystemSummaryPoint1: 'Token',
    ecosystemSummaryPoint2: 'Wallet',
    ecosystemSummaryPoint3: 'Segurança quântica',
    ecosystemSummaryPoint4: 'Plataforma DeFi',
    ecosystemSummaryPoint5: 'Cartão e pagamentos',
    ecosystemSummaryPoint6: 'Launchpad',
    ecosystemSummaryPoint7: 'Marketplace',
    ecosystemSummaryPoint8: 'Governança',
    ecosystemSummaryPoint9: 'Formação',
    ecosystemSummaryPoint10: 'Comunidade',
    ecosystemSummaryConclusion: '✨ Tudo conectado para criar uma economia descentralizada real, onde a cooperação multiplica o valor.',
    
    // Sustainability Tab Content - NEW CONTENT
    sustainabilityIntro: '💎 MXI é sustentável a longo prazo porque seu modelo econômico é baseado em utilidade real, crescimento orgânico e participação comunitária. Ao contrário de projetos especulativos, MXI incorpora serviços que geram movimento constante do token: pagamentos, marketplace, empréstimos, staking, cartão, ferramentas para empreendedores e programas de valor compartilhado. Cada serviço alimenta o ecossistema, evitando a dependência de novos compradores para sustentar a economia.',
    sustainabilityDecentralized: '🌍 Além disso, a abordagem descentralizada permite que a comunidade impulsione decisões-chave, criando um sistema adaptável, autossuficiente e resistente a crises externas. A adoção de tecnologias avançadas como a segurança quântica, a modularidade de sua arquitetura e o foco na economia real garantem que MXI evolua, se expanda e permaneça relevante durante as próximas décadas.',
    
    // Vesting Diario Tab Content - NEW CONTENT
    vestingDiarioIntro: 'O Vesting Diário é um mecanismo projetado para proteger a estabilidade do projeto durante a pré-venda e, ao mesmo tempo, fornecer aos investidores uma forma justa, previsível e sustentável de receber seus tokens. Em vez de liberar todos os tokens imediatamente—o que geralmente gera quedas drásticas devido a vendas massivas—MXI distribui as alocações de forma progressiva, equilibrada e transparente.',
    vestingDiarioHowItWorks: 'Desde o momento em que um usuário adquire MXI na pré-venda, seu saldo total é registrado em um contrato inteligente que gerencia a liberação diária. A cada 24 horas, uma porcentagem predefinida do total comprado é liberada automaticamente, permitindo ao usuário retirá-la, transferi-la ou usá-la dentro do ecossistema. Este processo garante que todos os participantes tenham acesso gradual aos seus tokens sem saturar o mercado, enquanto o projeto avança em desenvolvimento, crescimento de usuários, integração de serviços financeiros e expansão do ecossistema.',
    vestingDiarioBenefits: 'O objetivo é criar um equilíbrio natural entre oferta e demanda, o que fortalece a valorização do token e beneficia os primeiros investidores com um modelo sustentável.',
    vestingDiarioTransparency: 'Além disso, o vesting diário é parte do compromisso da MXI com a transparência: cada liberação pode ser auditada na blockchain, e os usuários mantêm o controle total sobre seu fluxo de tokens sem depender de intermediários.',
    vestingDiarioSummaryTitle: 'Em resumo, o vesting diário é uma ferramenta projetada para:',
    vestingDiarioBenefit1: '🛡️ Proteger o valor do token e evitar quedas abruptas.',
    vestingDiarioBenefit2: '📈 Acompanhar o crescimento real do ecossistema.',
    vestingDiarioBenefit3: '🤝 Criar igualdade entre os investidores na fase inicial.',
    vestingDiarioBenefit4: '🔍 Garantir rastreabilidade e segurança em cada liberação.',
    vestingDiarioBenefit5: '🔄 Oferecer liquidez progressiva sem comprometer a sustentabilidade.',
    vestingDiarioConclusion: 'Com este modelo, MXI constrói um cenário responsável e de projeção futura, onde cada membro da comunidade recebe sua parte de forma equilibrada, enquanto o projeto desenvolve as bases de uma economia real descentralizada.',
    
    // Quantum Security Tab Content - UPDATED CONTENT
    quantumSecurityTitle: 'Segurança Quântica',
    quantumSecurityIntro: '🔐 MXI integrará segurança quântica através de algoritmos pós-quânticos certificados, técnicas de criptografia resistentes à computação quântica e estruturas de identidade digital impossíveis de violar mesmo contra ataques avançados.',
    quantumSecurityTechnical: '⚛️ Isso inclui algoritmos baseados em redes lattices, assinaturas criptográficas resistentes e protocolos de troca de chaves capazes de enfrentar forças de computação superiores.',
    quantumSecurityNecessity: '⚠️ Esta segurança é necessária porque o avanço da computação quântica representa um risco real para as criptomoedas, os sistemas bancários e toda a infraestrutura digital atual.',
    quantumSecurityExpansion: '✨ MXI adota esta tecnologia para suas primeiras fases expansivas, garantindo que seu ecossistema permaneça seguro, confiável e preparado para as demandas tecnológicas do futuro, protegendo tanto investidores quanto projetos e empreendedores.',
    
    // In Practice Tab Content - NEW KEYS (using quantum security content)
    inPracticeIntro: '🔐 MXI integrará segurança quântica através de algoritmos pós-quânticos certificados, técnicas de criptografia resistentes à computação quântica e estruturas de identidade digital impossíveis de violar mesmo contra ataques avançados.',
    inPracticeTechnical: '⚛️ Isso inclui algoritmos baseados em redes lattices, assinaturas criptográficas resistentes e protocolos de troca de chaves capazes de enfrentar forças de computação superiores.',
    inPracticeNecessity: '⚠️ Esta segurança é necessária porque o avanço da computação quântica representa um risco real para as criptomoedas, os sistemas bancários e toda a infraestrutura digital atual.',
    inPracticePresale: '✨ MXI adota esta tecnologia desde a fase de pré-venda para garantir que seu ecossistema permaneça seguro, confiável e preparado para as demandas tecnológicas do futuro, protegendo tanto investidores quanto projetos e empreendedores.',
    
    // Tokenomics Tab Content - NEW CONTENT
    tokenomicsIntro: 'A tokenômica do MXI foi projetada para criar um ecossistema sólido, escalável e preparado para o futuro. Nosso modelo híbrido combina três pilares: 1) utilidade real, 2) crescimento algorítmico programado, e 3) fortalecimento comunitário. Isso permite que o MXI mantenha estabilidade, crie demanda progressiva e entregue benefícios tanto para pequenos quanto para grandes investidores.',
    
    // Section 1: Hybrid Model Structure
    tokenomicsSection1Title: '🔹 1. Estrutura do Modelo Híbrido',
    tokenomicsSection1Intro: 'O modelo econômico do MXI opera sobre três mecanismos simultâneos:',
    tokenomicsSection1ATitle: 'A. Oferta controlada com liberação inteligente (Vesting Diário)',
    tokenomicsSection1ADesc: 'Cada compra na pré-venda entra em um sistema de liberação diária automática, o que:',
    tokenomicsSection1APoint1: 'Reduz a pressão de venda.',
    tokenomicsSection1APoint2: 'Aumenta a estabilidade do preço.',
    tokenomicsSection1APoint3: 'Garante fluxo constante de liquidez.',
    tokenomicsSection1ABenefit: 'Benefício direto: mesmo antes da listagem, os detentores recebem um token com demanda orgânica crescente.',
    tokenomicsSection1BTitle: 'B. Crescimento impulsionado por demanda + queima progressiva',
    tokenomicsSection1BDesc: 'MXI integra um algoritmo de ajuste dinâmico, onde:',
    tokenomicsSection1BPoint1: 'Parte das comissões é queimada.',
    tokenomicsSection1BPoint2: 'Outra parte é reinvestida em liquidez e desenvolvimento.',
    tokenomicsSection1BModel: 'Isso gera um modelo deflacionário controlado: com maior uso → menor oferta → maior valorização.',
    tokenomicsSection1CTitle: 'C. Token de utilidade + economia descentralizada',
    tokenomicsSection1CDesc: 'MXI será usado dentro do ecossistema para:',
    tokenomicsSection1CPoint1: 'Pagamentos.',
    tokenomicsSection1CPoint2: 'Acesso a ferramentas Web3.',
    tokenomicsSection1CPoint3: 'Créditos descentralizados.',
    tokenomicsSection1CPoint4: 'Recompensas.',
    tokenomicsSection1CPoint5: 'Identidade digital quântica.',
    tokenomicsSection1CUtility: 'A utilidade real evita que o MXI dependa apenas de especulação.',
    
    // Section 2: Model Advantages
    tokenomicsSection2Title: '🔹 2. Vantagens do Modelo com Cifras Projetadas',
    tokenomicsSection2Intro: 'Baseado em preços oficiais:',
    tokenomicsSection2TableTitle: 'Etapa | Preço',
    tokenomicsSection2Phase1: 'Pré-venda 1: 0.40 USDT',
    tokenomicsSection2Phase2: 'Pré-venda 2: 0.70 USDT',
    tokenomicsSection2Phase3: 'Pré-venda 3: 1.00 USDT',
    tokenomicsSection2Listing: 'Preço estimado de listagem: 3.00 USDT',
    tokenomicsSection2ProjectionTitle: 'Projeção de valorização inicial',
    tokenomicsSection2Projection1: 'Compra em 0.40 → potencial x7.5 na listagem.',
    tokenomicsSection2Projection2: 'Compra em 0,70 → x4,2.',
    tokenomicsSection2Projection3: 'Compra em 1.00 → x3.',
    tokenomicsSection2Conclusion: 'Essas cifras são fortalecidas pelo modelo híbrido, que estabiliza o mercado evitando quedas bruscas.',
    
    // Section 3: Comparison with Other Cryptocurrencies
    tokenomicsSection3Title: '🔹 3. Por que é superior ao modelo de outras criptomoedas?',
    tokenomicsSection3BTCTitle: 'BTC – escassez pura',
    tokenomicsSection3BTCPro1: 'deflacionário',
    tokenomicsSection3BTCCon1: 'sem utilidade programável',
    tokenomicsSection3BTCCon2: 'alta volatilidade',
    tokenomicsSection3BTCConclusion: 'MXI combina escassez mais utilidade real.',
    tokenomicsSection3ETHTitle: 'ETH – gas e contratos inteligentes',
    tokenomicsSection3ETHPro1: 'grande ecossistema',
    tokenomicsSection3ETHCon1: 'comissões variáveis',
    tokenomicsSection3ETHConclusion: 'MXI integra utilidade + baixas comissões + segurança quântica.',
    tokenomicsSection3ADATitle: 'ADA – abordagem acadêmica e escalabilidade',
    tokenomicsSection3ADAPro1: 'estrutura sólida',
    tokenomicsSection3ADACon1: 'adoção lenta',
    tokenomicsSection3ADAConclusion: 'MXI prioriza uso imediato (pagamentos, empréstimos, identidade).',
    tokenomicsSection3SOLTitle: 'SOL – alta velocidade',
    tokenomicsSection3SOLPro1: 'transações rápidas',
    tokenomicsSection3SOLCon1: 'histórico de quedas e centralização',
    tokenomicsSection3SOLConclusion: 'MXI combina velocidade com segurança quântica + estabilidade econômica.',
    
    // Section 4: Direct Benefits for Investors
    tokenomicsSection4Title: '🔹 4. Benefícios Diretos para o Investidor',
    tokenomicsSection4ShortTerm: 'Curto prazo',
    tokenomicsSection4ShortPoint1: 'Ganho por preço baixo de pré-venda.',
    tokenomicsSection4ShortPoint2: 'Aquisição diária como fluxo controlado.',
    tokenomicsSection4MediumTerm: 'Médio prazo',
    tokenomicsSection4MediumPoint1: 'Primeiros casos de uso do token.',
    tokenomicsSection4MediumPoint2: 'Expansão do ecossistema: cartão MXI, pagamentos, serviços Web3.',
    tokenomicsSection4LongTerm: 'Longo prazo',
    tokenomicsSection4LongPoint1: 'Empréstimos descentralizados.',
    tokenomicsSection4LongPoint2: 'Governança comunitária.',
    tokenomicsSection4LongPoint3: 'Apreciação do preço por queima + adoção real.',
    
    // Conclusion
    tokenomicsConclusionTitle: 'MXI: um modelo projetado para crescer com sua comunidade',
    tokenomicsConclusionText: 'Quanto mais o ecossistema cresce, mais forte se torna o valor do token e todos ganham: empreendedores, investidores e usuários reais.',
    
    // Investor Profiles - En la Práctica Tab
    investorProfilesIntro: 'A seguir são explicados três perfis de investidores e como o MXI poderia gerar utilidade real para eles em diferentes horizontes de tempo, usando as cifras de crescimento projetado.',
    
    // Basic Investor
    basicInvestorTitle: '🟦 1. Investidor Básico (Compra Direta – Sem Participar em Desafios)',
    shortTermLabel: 'Curto Prazo (0–6 meses)',
    basicInvestorShortTerm: 'Compra na pré-venda a 0.40 – 0.70 – 1.00 USDT. Se o token for listado a 3 USDT, sua utilidade imediata seria:',
    basicInvestorTable: 'Preço de compra | Ganho potencial na listagem (3 USDT) | % Aproximado\n0.40 | 650% | +650%\n0.70 | 328% | +328%\n1.00 | 200% | +200%',
    basicInvestorExample: 'Exemplo prático: Compra 1,000 MXI a 0.40 = 400 USDT → Na listagem a 3 USDT → 3,000 USDT.',
    mediumTermLabel: 'Médio Prazo (6–18 meses)',
    basicInvestorMediumTerm: 'Liberação diária do vesting, o que reduz pressão de venda e aumenta estabilidade. Pode usar MXI dentro do ecossistema para:',
    basicInvestorMediumPoint1: '✔ Pagamentos com cartão',
    basicInvestorMediumPoint2: '✔ Comissões reduzidas',
    basicInvestorMediumPoint3: '✔ Participação antecipada em novos produtos MXI',
    longTermLabel: 'Longo Prazo (18+ meses)',
    basicInvestorLongTerm: 'Se o MXI cumprir o objetivo de economia descentralizada, o token passa a ter:',
    basicInvestorLongPoint1: '✔ Valor de utilidade',
    basicInvestorLongPoint2: '✔ Valor de comunidade',
    basicInvestorLongPoint3: '✔ Possível apreciação por adoção',
    
    // Participative Investor
    participativeInvestorTitle: '🟩 2. Investidor Participativo (Compra + Vesting Diário + Referências)',
    participativeInvestorShortTerm: 'Obtém os mesmos ganhos potenciais do investidor básico.',
    referralBonusLabel: 'BÔNUS DE REFERÊNCIAS:',
    participativeInvestorBonus: 'Se convidar 10 pessoas que compram 500 USDT cada uma: Supondo um bônus de 5% → ganha 250 USDT adicionais em MXI. Esses MXI também entram no vesting diário.',
    participativeInvestorMediumTerm: 'Com o vesting diário, recebe liberações constantes.',
    participativeInvestorExample: 'Exemplo: Compra 2,000 USDT → recebe 2,000 MXI a 1 USDT. Vesting diário a 1% (exemplo) = 20 MXI diários. Se o preço sobe de 1 a 3 USDT, cada liberação vale mais.',
    participativeInvestorLongTerm: 'Seu portfólio cresce por 3 vias simultâneas:',
    participativeInvestorLongPoint1: '• Apreciação do preço',
    participativeInvestorLongPoint2: '• Liberação do vesting',
    participativeInvestorLongPoint3: '• MXI acumulado por referências ativas',
    participativeInvestorConclusion: 'É o perfil com maior potencial de crescimento composto.',
    
    // Strategic Investor
    strategicInvestorTitle: '🟧 3. Investidor Estratégico (Compra + Vesting + Referências + Desafios Opcionais)',
    strategicInvestorIntro: 'Este perfil aproveita todas as fontes de crescimento do ecossistema MXI.',
    strategicInvestorShortTerm: 'Rentabilidade imediata por pré-venda → listagem. Bônus adicionais por completar desafios:',
    strategicInvestorChallengePoint1: '• Desafios de volume',
    strategicInvestorChallengePoint2: '• Missões comunitárias',
    strategicInvestorChallengePoint3: '• Fornecer liquidez no lançamento',
    strategicInvestorExample: 'Exemplo: Compra 5,000 USDT a 0.40 = 12,500 MXI. Ganha 10% adicional por desafios = 1,250 MXI extra. Se o preço sobe a 3 USDT → esses 1,250 MXI valem 3,750 USDT.',
    strategicInvestorMediumTerm: 'Grande fluxo diário por vesting devido a maior volume de compra. Sobe nível no ecossistema → mais benefícios:',
    strategicInvestorMediumPoint1: '✔ Acesso prioritário a produtos',
    strategicInvestorMediumPoint2: '✔ Recompensas aumentadas',
    strategicInvestorMediumPoint3: '✔ Mais bonificação por referências',
    strategicInvestorLongTerm: 'Participa na governança do ecossistema. Acesso a rodadas privadas de projetos integrados no MXI.',
    strategicInvestorBenefits: 'Benefício composto extremo:',
    strategicInvestorBenefitPoint1: '✔ Preço MXI',
    strategicInvestorBenefitPoint2: '✔ Vesting',
    strategicInvestorBenefitPoint3: '✔ Desafios',
    strategicInvestorBenefitPoint4: '✔ Referências',
    strategicInvestorBenefitPoint5: '✔ Crescimento da rede',
    
    // Meta Tab Content - NEW CONTENT (Portuguese translation)
    metaTitle: 'Nossa Meta',
    metaIntro: '🎯 Nossa meta é construir uma economia real, descentralizada e sustentável, projetada para libertar as pessoas e os negócios da dependência do sistema financeiro tradicional. Nosso propósito é simples, mas poderoso: criar um ecossistema onde o crescimento seja impulsionado pela comunidade, não pelas instituições centrais, focado como primeira medida no público latino-americano, suas necessidades e fortalezas.',
    metaVision: '💎 MXI nasce com uma visão clara: democratizar as oportunidades econômicas. Por isso, nosso ecossistema integrará soluções reais como sistemas de empréstimos peer-to-peer, apoio direto a empreendedores, ferramentas para investidores e mecanismos de liquidez que favorecem o desenvolvimento da comunidade. Quando a comunidade cresce, MXI cresce; e quando MXI avança, todos ganham.',
    metaModel: '🔗 Buscamos construir um modelo econômico no qual o valor não seja controlado por poucos, mas distribuído entre aqueles que participam ativamente. Nossa abordagem combina tecnologia blockchain avançada, segurança quântica de nova geração e uma infraestrutura projetada para escalar globalmente, criando um ambiente seguro, transparente e preparado para os desafios do futuro.',
    metaObjective: '🚀 O objetivo final é consolidar MXI como um motor de desenvolvimento:',
    metaObjectivePoint1: '• Uma ponte real para empreendedores que precisam de financiamento',
    metaObjectivePoint2: '• Uma alternativa sólida para investidores que buscam crescimento descentralizado',
    metaObjectivePoint3: '• Um ecossistema autossustentável no qual cada contribuição fortalece o sistema completo',
    metaConclusion: '✨ MXI não é apenas um token: é uma visão compartilhada. E se a comunidade o apoia, MXI se torna uma força econômica capaz de transformar realidades.',
    
    // How It Works Tab - UPDATED CONTENT
    howItWorksTitle: 'Como o MXI Funciona',
    howItWorksIntro: '🚀 O MXI funciona como um ecossistema em expansão projetado para crescer em fases, garantindo que cada etapa impulsione a próxima. Hoje estamos em pré-venda, a fase mais inicial e estratégica do projeto, onde os primeiros participantes obtêm acesso antecipado ao token antes de sua integração total no sistema.',
    step1Title: '1️⃣ Aquisição Antecipada do Token (Pré-venda)',
    step1Description: 'Durante esta etapa, os usuários compram MAXCoin (MXI) a preços preferenciais (0.40, 0.70 e 1.00 USDT). Esses tokens não são liberados todos de uma vez: eles entram em um sistema automatizado de vesting que garante estabilidade e distribuição controlada.',
    step2Title: '2️⃣ Vesting Diário Inteligente',
    step2Description: 'Os tokens adquiridos são liberados através de um Vesting Diário de 3% mensal, calculado e liberado minuto a minuto. Este mecanismo garante três coisas:\n\n• Circulação progressiva\n• Proteção do mercado\n• Maior sustentabilidade do preço\n\nEm outras palavras, você recebe seus tokens de forma constante e previsível sem saturar a oferta.',
    step3Title: '3️⃣ Ecossistema em Construção Ativa',
    step3Description: 'Enquanto os usuários recebem MXI, a equipe desenvolve e integra os componentes centrais:\n\n• MXI App: gestão de saldos, vesting, rede de expansão e ferramentas internas\n• Torneios de habilidade: recompensas geradas por participação real\n• MXI Pay: sistema de pagamentos com conversão instantânea\n• Cartão MXI: que permitirá usar seu saldo em qualquer comerciante compatível\n• Segurança Quântica: algoritmos pós-quânticos que protegem transações e chaves\n\nTudo isso é ativado em etapas conforme a pré-venda é concluída.',
    step4Title: '4️⃣ Entrada no Mercado e Fase de Expansão',
    step4Description: 'Uma vez que a pré-venda termine e o app esteja em operação completa, o MXI inicia seu ciclo de crescimento:\n\n• Utilidade diária do token\n• Integração com comerciantes\n• Marketplace interno\n• Expansão internacional\n• Futura migração para seu próprio blockchain\n\nIsso é fundamental: a valorização é impulsionada pelo uso, não pela especulação.\n\n✨ O MXI funciona como um sistema vivo: permite que você entre cedo, receba seu token de forma ordenada e acompanhe o crescimento de um ecossistema projetado para escalar nos próximos meses.',
    keyBenefits: 'Benefícios Principais',
    instantTransactions: 'Transações Instantâneas',
    instantTransactionsDesc: 'Transações rápidas e seguras na blockchain',
    maximumSecurity: 'Máxima Segurança',
    maximumSecurityDesc: 'Protegido com tecnologia de criptografia quântica',
    globalAccess: 'Acesso Global',
    globalAccessDesc: 'Disponível 24/7 de qualquer lugar do mundo',
    
    // What is MXI? Tab - NEW CONTENT (Portuguese translation)
    whatIsMXITitle: 'O que é MXI?',
    whatIsMXIIntro: '🚀 MXI é um projeto cripto-tecnológico em construção que hoje se encontra em fase de pré-lançamento estratégico, permitindo aos primeiros participantes acessar antecipadamente um ecossistema projetado para se expandir rapidamente nos próximos meses. Seu token nativo, MAXCoin (MXI), possui uma emissão limitada de 50 milhões e um modelo econômico baseado em utilidade real, vesting diário e liquidez programada.',
    whatIsMXIEarlyStage: '⚡ Durante esta fase inicial, o MXI está sendo estruturado para se tornar uma rede integral de pagamentos, recompensas, torneios de habilidade, integração com comerciantes e um cartão vinculado à carteira MXI, que permitirá usar os saldos a qualquer momento. O projeto também incorpora um sistema de segurança quântica voltado para proteger transações e chaves contra tecnologias emergentes, garantindo um ecossistema preparado para o futuro.',
    whatIsMXIPresale: '💎 Na pré-venda, o MXI oferece acesso a preços iniciais inferiores ao valor projetado do token uma vez que as funções principais do ecossistema sejam ativadas. É a fase onde a base é construída: comunidade, liquidez inicial, mecanismos internos e conexão progressiva com as ferramentas do projeto.',
    whatIsMXINotJustToken: '🎯 MXI não é apenas um token: é um modelo projetado para crescer rápido, integrar serviços reais e se posicionar como uma infraestrutura digital pronta para escalar no curto prazo.',
    
    // How MXI Works - NEW CONTENT (Portuguese translation)
    howMXIWorksTitle: 'Como o MXI funciona? (versão técnica-persuasiva)',
    howMXIWorksIntro: 'O MXI funciona através de um sistema modular de componentes que são ativados progressivamente:',
    howMXIWorksStep1Title: '1️⃣ Pré-venda com acesso antecipado',
    howMXIWorksStep1Desc: 'Os usuários adquirem MXI a preços preferenciais antes do lançamento oficial. Desde o primeiro dia, o sistema gera uma versão simulada do saldo que depois entra em vesting.',
    howMXIWorksStep2Title: '2️⃣ Vesting Diário de 3% mensal',
    howMXIWorksStep2Desc: 'Os tokens são liberados de forma fracionada minuto a minuto, evitando concentrações e mantendo a circulação controlada.',
    howMXIWorksStep3Title: '3️⃣ Ecossistema interno em expansão',
    howMXIWorksStep3Desc: 'Inclui:',
    howMXIWorksStep3Point1: '• Pagamentos entre usuários',
    howMXIWorksStep3Point2: '• Torneios de habilidade',
    howMXIWorksStep3Point3: '• Recompensas por participação',
    howMXIWorksStep3Point4: '• Ferramentas para crescimento e comunidade',
    howMXIWorksStep4Title: '4️⃣ Cartão vinculado',
    howMXIWorksStep4Desc: 'Permitirá usar MXI ou USDT diretamente em comerciantes físicos e digitais, tornando a utilidade do token algo imediato e prático.',
    howMXIWorksStep5Title: '5️⃣ Segurança quântica',
    howMXIWorksStep5Desc: 'Criptografia resistente a tecnologias emergentes para proteger transações, ativos e chaves privadas.',
    howMXIWorksStep6Title: '6️⃣ Expansão progressiva',
    howMXIWorksStep6Desc: 'O projeto migrará para um blockchain próprio quando a comunidade e a infraestrutura justificarem, aumentando velocidade, escalabilidade e eficiência.',
    howMXIWorksConclusion: '✨ O MXI funciona como um ecossistema vivo que se ativa por etapas, projetado para aumentar utilidade, adoção e valor conforme evolui.',
    
    // Why Buy Tab Content - NEW CONTENT
    whyBuyTitle: 'Por Que Comprar MXI?',
    whyBuyIntro: '💎 Comprar MXI na pré-venda é uma oportunidade estratégica porque permite entrar antes que o ecossistema esteja completamente operacional, acessando preços que não se repetirão.',
    whyBuyReason1: '1️⃣ Preço Preferencial e Vantagem Antecipada',
    whyBuyReason1Desc: 'O token está disponível a partir de 0.40 USDT, com projeções otimistas entre 4.5 e 8 USDT à medida que pagamentos, cartão e expansão comercial são ativados.',
    whyBuyReason2: '2️⃣ Emissão Limitada e Alta Demanda Projetada',
    whyBuyReason2Desc: 'Apenas 50 milhões de tokens existirão. A utilidade real (pagamentos, torneios, recompensas, cartão) aumenta a pressão de demanda futura.',
    whyBuyReason3: '3️⃣ Ecossistema com Utilidade Imediata',
    whyBuyReason3Desc: 'Você não está apenas comprando um token: está comprando acesso a uma rede que poderá usar para pagar, competir, enviar dinheiro e consumir serviços.',
    whyBuyReason4: '4️⃣ Segurança Quântica Integrada',
    whyBuyReason4Desc: 'MXI nasce preparado para o futuro, com tecnologia de proteção avançada que aumenta seu valor diferencial em comparação com outros projetos.',
    whyBuyReason5: '5️⃣ Cartão MXI: Uso Real do Token',
    whyBuyReason5Desc: 'Seu MXI não fica armazenado: você poderá usá-lo em qualquer comerciante, instantaneamente.',
    whyBuyReason6: '6️⃣ Projeto Projetado para Crescer no Curto Prazo',
    whyBuyReason6Desc: 'O roteiro implanta funções rapidamente: vesting ativo, torneios, ferramentas, comerciantes, marketplace e futura migração para blockchain próprio.',
    whyBuyReason7: '7️⃣ Vantagem de Estar Entre os Primeiros',
    whyBuyReason7Desc: 'Entrar cedo não é apenas mais econômico: posiciona você antes do crescimento, adoção em massa e expansão internacional.',
    whyBuyConclusion: '✨ MXI é uma oportunidade de pré-venda para aqueles que querem participar no início de um ecossistema projetado com visão, tecnologia e utilidade real.',
    investmentAdvantages: 'Vantagens de Investimento',
    growthPotential: 'Potencial de Crescimento',
    growthPotentialDesc: 'Entrada antecipada a preços preferenciais',
    limitedSupply: 'Fornecimento Limitado',
    limitedSupplyDesc: 'Apenas 50 milhões de tokens',
    realUtility: 'Utilidade Real',
    realUtilityDesc: 'Pagamentos, torneios e cartão',
    globalCommunity: 'Comunidade Global',
    globalCommunityDesc: 'Rede internacional em crescimento',
    
    // Launch Countdown
    officialLaunch: 'Lançamento Oficial',
    maxcoinMXI: 'MAXCOIN (MXI)',
    launchDate: '15 de fevereiro de 2026 às 12:00 UTC',
    presaleStart: 'Início da Pré-venda',
    presaleEnd: 'Finalização da Pré-venda',
    days: 'Dias',
    hours: 'Horas',
    minutes: 'Minutos',
    seconds: 'Segundos',
    poolActive: 'Pool Ativo',
    vestingRealTime: 'Vesting em Tempo Real',
    
    // Deposit Page
    buyMXIWithMultipleOptions: 'Compre MXI com múltiplas opções',
    currentBalance: 'Saldo Atual',
    paymentOptions: 'Opções de Pagamento',
    multiCryptoPayment: 'Pagamento Multi-Cripto',
    directUSDTPayment: 'Pagamento Direto em USDT',
    manualPaymentVerification: 'Verificação Manual de Pagamentos',
    transactionHistory: 'Histórico de Transações',
    
    // Manual Verification
    manualVerification: 'Verificação Manual',
    nowPayments: 'NowPayments',
    directUSDT: 'USDT Direto',
    
    // Withdrawals
    retiros: 'Retiradas',
    loadingData: 'Carregando dados...',
    
    // Rewards
    loadingRewards: 'Carregando recompensas...',
    earnMXIMultipleWays: 'Ganhe MXI de várias maneiras',
    totalMXIEarned: 'Total MXI Ganho',
    bonus: 'Bônus',
    rewardPrograms: 'Programas de Recompensas',
    participationBonus: 'Bônus de Participação',
    participateInWeeklyDrawings: 'Participe de sorteios semanais',
    vestingAndYield: 'Vesting e Rendimento',
    generatePassiveIncome: 'Gere renda passiva',
    live: 'Ao Vivo',
    referralSystem: 'Sistema de Referências',
    earnCommissionsFrom3Levels: 'Ganhe comissões de 3 níveis',
    moreRewardsComingSoon: 'Mais Recompensas em Breve!',
    workingOnNewRewards: 'Estamos trabalhando em novas formas de recompensar nossa comunidade',
    tournamentsAndCompetitions: 'Torneios e Competições',
    achievementBonuses: 'Bônus por Conquistas',
    loyaltyRewards: 'Recompensas por Lealdade',
    specialEvents: 'Eventos Especiais',
    benefitsOfRewards: 'Benefícios das Recompensas',
    earnAdditionalMXI: 'Ganhe MXI adicional além da sua compra inicial',
    participateInExclusiveDrawings: 'Participe de sorteios e bônus exclusivos',
    generateAutomaticPassiveIncome: 'Gere renda passiva automática através do vesting',
    bonusesForActiveReferrals: 'Bônus por manter referências ativas',
    rewardsForContinuedParticipation: 'Recompensas por participação contínua',
    maximizeYourRewards: 'Maximize suas Recompensas',
    keepAtLeast5ActiveReferrals: 'Mantenha pelo menos 5 referências ativas',
    participateRegularlyInBonus: 'Participe regularmente do Bônus MXI',
    activateVestingForPassiveIncome: 'Ative o vesting para renda passiva',
    shareYourReferralCode: 'Compartilhe seu código de referência com amigos',
    
    // Lottery/Bonus Participation Screen
    bonusParticipation: 'Bônus de Participação',
    loadingBonusText: 'Carregando bônus...',
    failedToLoadBonusData: 'Falha ao carregar dados do bônus',
    noActiveBonusRoundText: 'Nenhuma rodada de bônus ativa',
    retryButton: 'Tentar Novamente',
    roundText: 'Rodada',
    openText: 'Aberto',
    lockedText: 'Bloqueado',
    prizePoolText: 'Poço de Prêmios',
    totalPoolText: 'Poço Total',
    ticketsSoldText: 'Bilhetes Vendidos',
    ticketPriceText: 'Preço do Bilhete',
    yourTicketsText: 'Seus Bilhetes',
    availableMXIText: 'MXI Disponível',
    purchaseTicketsText: 'Comprar Bilhetes',
    buyBetween1And20TicketsText: 'Compre entre 1 e 20 bilhetes',
    buyTicketsText: 'Comprar Bilhetes',
    howItWorksBonusText: 'Como Funciona',
    eachTicketCosts2MXIText: 'Cada bilhete custa 2 MXI',
    buyBetween1And20TicketsPerRoundText: 'Compre entre 1 e 20 bilhetes por rodada',
    roundLocksWhen1000TicketsSoldText: 'A rodada bloqueia quando 1.000 bilhetes são vendidos',
    winnerReceives90PercentText: 'O vencedor recebe 90% do poço',
    winnerAnnouncedOnSocialMediaText: 'O vencedor é anunciado nas redes sociais',
    purchaseIsFinalNoRefundsText: 'A compra é final, sem reembolsos',
    numberOfTicketsText: 'Número de Bilhetes',
    enterQuantityText: 'Digite a quantidade',
    ticketsText: 'Bilhetes',
    pricePerTicketText: 'Preço por Bilhete',
    totalCostText: 'Custo Total',
    cancelButton: 'Cancelar',
    continueButton: 'Continuar',
    selectPaymentSourceText: 'Selecionar Fonte de Pagamento',
    chooseWhichMXIBalanceText: 'Escolha qual saldo de MXI usar',
    mxiPurchasedSourceText: 'MXI Comprado',
    mxiFromCommissionsSourceText: 'MXI de Comissões',
    mxiFromChallengesSourceText: 'MXI de Desafios',
    pleaseEnterValidQuantity: 'Por favor, digite uma quantidade válida (1-20)',
    insufficientBalance: 'Saldo Insuficiente',
    insufficientBalanceNeedForTicketsText: 'Você precisa de {{needed}} MXI para {{quantity}} bilhetes, mas só tem {{available}} MXI disponíveis',
    insufficientBalanceInSourceText: 'Saldo insuficiente em {{source}}. Disponível: {{available}} MXI, Necessário: {{needed}} MXI',
    failedToDeductBalance: 'Falha ao deduzir saldo',
    failedToPurchaseTicketsText: 'Falha ao comprar bilhetes',
    successTitle: 'Sucesso',
    successfullyPurchasedTicketsText: 'Comprou com sucesso {{count}} bilhetes por {{cost}} MXI de {{source}}',
    onlyUsePurchasedCommissionsOrTournamentsText: 'Use apenas MXI de compras, comissões ou torneios para comprar bilhetes',
    
    // Admin - Participation Bonus Management
    participationBonusManagement: 'Gestão de Bônus de Participação',
    manageBonusSettings: 'Gerenciar configurações de bônus e participantes',
    bonusSettings: 'Configurações do Bônus',
    currentRound: 'Rodada Atual',
    roundNumber: 'Número da Rodada',
    maxParticipants: 'Máximo de Participantes',
    ticketsSold: 'Bilhetes Vendidos',
    totalPool: 'Poço Total',
    prizePool: 'Poço de Prêmios',
    roundStatus: 'Status da Rodada',
    open: 'Aberto',
    locked: 'Bloqueado',
    drawn: 'Sorteado',
    completed: 'Concluído',
    updateSettings: 'Atualizar Configurações',
    resetBonus: 'Reiniciar Bônus',
    downloadParticipants: 'Baixar Participantes',
    maxParticipantsLabel: 'Máximo de Participantes',
    ticketPriceLabel: 'Preço do Bilhete (MXI)',
    enterMaxParticipants: 'Digite o máximo de participantes',
    enterTicketPrice: 'Digite o preço do bilhete',
    updateBonusSettings: 'Atualizar Configurações do Bônus',
    resetBonusConfirmTitle: 'Reiniciar Bônus de Participação?',
    resetBonusConfirmMessage: 'Isso irá:\n\n• Fechar a rodada atual\n• Criar uma nova rodada com as configurações atuais\n• Reiniciar todos os contadores para 0\n\nEsta ação não pode ser desfeita.',
    resetBonusSuccess: 'Bônus reiniciado com sucesso',
    resetBonusError: 'Erro ao reiniciar o bônus',
    updateSettingsSuccess: 'Configurações atualizadas com sucesso',
    updateSettingsError: 'Erro ao atualizar as configurações',
    downloadingParticipants: 'Baixando participantes...',
    noParticipantsYet: 'Ainda não há participantes',
    participantsList: 'Lista de Participantes',
    downloadComplete: 'Download Completo',
    participantsDownloaded: 'Dados dos participantes baixados com sucesso',
    downloadError: 'Erro ao baixar participantes',
    bonusManagementActions: 'Ações de Gestão do Bônus',
    resetBonusButton: 'Reiniciar Bônus para 0',
    updateLimitsButton: 'Atualizar Limites',
    downloadDataButton: 'Baixar Dados dos Participantes',
    currentBonusStats: 'Estatísticas Atuais do Bônus',
    participantsCount: 'Participantes',
    totalTicketsSold: 'Total de Bilhetes Vendidos',
    currentPrizePool: 'Poço de Prêmios Atual',
    settingsUpdatedSuccessfully: 'Configurações atualizadas com sucesso',
    bonusResetSuccessfully: 'Bônus reiniciado com sucesso. Nova rodada criada.',
    confirmResetBonus: 'Confirmar Reinício do Bônus',
    typeResetBonusToConfirm: 'Digite "RESETAR BÔNUS" para confirmar:',
    mustTypeResetBonus: 'Você deve digitar "RESETAR BÔNUS" para confirmar',
    participantData: 'Dados do Participante',
    ticketNumber: 'Número do Bilhete',
    userName: 'Nome do Usuário',
    userEmail: 'Email do Usuário',
    purchaseDate: 'Data de Compra',
    ticketQuantity: 'Quantidade',
    changesWillAffectCurrentRoundText: 'As alterações afetarão a rodada atual imediatamente',
    more: 'mais',
    locale: 'pt',
    
    // Vesting Screen
    mxiVestingBalance: 'Saldo de Vesting MXI',
    loadingVestingDataText: 'Carregando dados de vesting...',
    vestingSourceTitle: 'Fonte de Vesting',
    vestingSourceDescriptionText: 'O vesting é gerado apenas do MXI comprado diretamente. Comissões e ganhos de torneios não geram vesting.',
    mxiPurchasedVestingBaseText: 'MXI Comprado (Base de Vesting)',
    mxiInVestingText: 'MXI em Vesting',
    availableForWithdrawalText: 'Disponível para retirada',
    blockedUntilLaunchText: 'Bloqueado até o lançamento',
    daysRemainingText: 'dias restantes',
    balanceBlockedTitle: 'Saldo Bloqueado',
    balanceBlockedDescriptionText: 'Seu saldo de vesting está bloqueado até o lançamento oficial do MXI. Após o lançamento, você poderá retirar seu MXI em liberações progressivas.',
    timeUntilLaunchText: 'Tempo Até o Lançamento',
    releasedText: 'Liberado',
    vestingInformationText: 'Informações de Vesting',
    releasePercentageText: 'Porcentagem de Liberação',
    everyTenDaysText: 'a cada 10 dias',
    releasesCompletedText: 'Liberações Concluídas',
    nextReleaseText: 'Próxima Liberação',
    withdrawalStatusText: 'Status de Retirada',
    enabledText: 'Habilitado',
    blockedUntilLaunchShortText: 'Bloqueado até o lançamento',
    whatIsVestingText: 'O que é Vesting?',
    vestingDescriptionText: 'O vesting é um sistema que bloqueia seu MXI comprado até o lançamento oficial. Isso garante estabilidade e valor a longo prazo para o token.',
    vestingReleaseInfoText: 'Após o lançamento, {{percentage}}% do seu saldo de vesting é liberado a cada 10 dias, permitindo que você retire gradualmente seu MXI.',
    vestingReleaseInfoPreLaunchText: 'Após o lançamento, {{percentage}}% do seu saldo de vesting será liberado a cada 10 dias, permitindo que você retire gradualmente seu MXI.',
    vestingImportantNoteText: '⚠️ Importante: Apenas o MXI comprado diretamente gera vesting. Comissões e ganhos de torneios estão disponíveis imediatamente (com requisitos).',
    withdrawMXIText: 'Retirar MXI',
    withdrawVestingBalanceText: 'Retire seu saldo de vesting',
    
    // Referrals Page
    commissionsByReferrals: 'Comissões por Referências',
    yourReferralCode: 'Seu Código de Referência',
    shareCode: 'Compartilhar Código',
    shareReferralCode: 'Junte-se ao MXI com meu código de referência',
    commissionBalance: 'Saldo de Comissões',
    totalEarnedByReferrals: 'Total Ganho por Referências',
    allCommissionsCreditedMXI: 'Todas as comissões são creditadas diretamente em MXI',
    yourReferrals: 'Suas Referências',
    level: 'Nível',
    referralsText: 'referências',
    activeReferralsLevel1: 'Referências Ativas (Nível 1)',
    howCommissionsWork: 'Como Funcionam as Comissões',
    earn5PercentLevel1: 'Ganhe 5% em MXI de referências de Nível 1',
    earn2PercentLevel2: 'Ganhe 2% em MXI de referências de Nível 2',
    earn1PercentLevel3: 'Ganhe 1% em MXI de referências de Nível 3',
    commissionsCalculatedOnMXI: 'As comissões são calculadas sobre as compras de MXI',
    need5ActiveReferrals: 'Precisa de 5 referências ativas para retirar',
    minimumWithdrawalIs50MXI: 'A retirada mínima é de 50 MXI',
    viewWithdrawalHistory: 'Ver Histórico de Retiradas',
    
    // Embajadores MXI
    ambassadorsMXI: 'Embaixadores MXI',
    earnBonusesForReferrals: 'Ganhe bônus por suas referências',
    earnAdditionalBonusesForReferrals: 'Ganhe bônus adicionais por suas referências',
    yourCurrentLevel: 'Seu Nível Atual',
    accumulatedValidPurchases: 'Compras Válidas Acumuladas',
    fromDirectReferrals: 'De referências diretas (Nível 1)',
    progressToNextLevel: 'Progresso para o Próximo Nível',
    withdrawableBonus: 'Bônus Retirável',
    cumulativeBonusesAvailable: 'Bônus cumulativos disponíveis',
    withdrawBonus: 'Retirar Bônus',
    allLevels: 'Todos os Níveis',
    withdrawalRequirements: 'Requisitos para Retirar',
    levelMustBeFullyAchieved: 'Ter o nível totalmente alcançado',
    mustHaveApprovedKYC: 'Deve ter KYC aprovado',
    mustHaveMinimum1PersonalPurchase: 'Deve ter mínimo 1 compra pessoal',
    withdrawalMethodUSDTTRC20Only: 'Método de retirada: USDT TRC20 apenas',
    importantInformation: 'Informação Importante',
    bonusesAdditionalTo5Percent: 'Os bônus são adicionais aos 5% de comissão por referências',
    allBonusesAreCumulative: 'Todos os bônus são cumulativos',
    onlyLevel1ReferralPurchasesCount: 'Apenas compras de referências diretas (Nível 1) contam',
    minimumAmountPerPurchase50USDT: 'Valor mínimo por compra: 50 USDT',
    onlyPresalePurchasesPaidInUSDT: 'Apenas compras de pré-venda pagas em USDT',
    usdtTRC20Address: 'Endereço USDT TRC20',
    enterYourTRC20Address: 'Digite seu endereço TRC20',
    onlyUSDTTRC20WithdrawalsAllowed: 'Apenas retiradas em USDT TRC20 permitidas',
    confirmBonusWithdrawal: 'Confirmar Retirada de Bônus',
    withdrawalRequestSentSuccessfully: 'Solicitação de retirada enviada com sucesso',
    noBonusesAvailableToWithdraw: 'Não há bônus disponíveis para retirar',
    addressRequired: 'Endereço Necessário',
    pleaseEnterYourUSDTTRC20Address: 'Por favor, digite seu endereço USDT TRC20',
    invalidAddress: 'Endereço Inválido',
    pleaseEnterValidTRC20Address: 'Por favor, digite um endereço USDT TRC20 válido (deve começar com T e ter 34 caracteres)',
    noLevelAchievedYet: 'Você ainda não alcançou nenhum nível',
    needValidPurchasesFromLevel1: 'Você precisa de {{amount}} USDT em compras válidas de referências de Nível 1',
    
    // Payment Status
    completed: 'Concluído',
    confirmed: 'Confirmado',
    waitingForPayment: 'Aguardando Pagamento',
    confirming: 'Confirmando',
    failed: 'Falhou',
    expired: 'Expirado',
    couldNotLoadVestingInfo: 'Não foi possível carregar informações',
    
    // Transaction History
    transactionHistoryTitle: 'Histórico de Transações',
    pendingTransactions: 'Pendentes',
    successfulTransactions: 'Bem-sucedidas',
    failedTransactions: 'Falhadas',
    purchaseMXINowPayments: 'Compra MXI (NowPayments)',
    purchaseMXIOKX: 'Compra MXI (OKX)',
    manualPayment: 'Pagamento Manual',
    commission: 'Comissão',
    allTransactions: 'Todas',
    couldNotLoadTransactionHistory: 'Não foi possível carregar o histórico de transações',
    couldNotOpenPaymentLink: 'Não foi possível abrir o link de pagamento',
    cancelTransaction: 'Cancelar Transação',
    areYouSureCancelTransaction: 'Tem certeza de que deseja cancelar esta transação?',
    noCancelIt: 'Não, manter',
    yesCancelIt: 'Sim, cancelar',
    cancelledByUser: 'Cancelado pelo usuário',
    cancelled: 'Cancelado',
    transactionCancelled: 'Transação cancelada com sucesso',
    couldNotCancelTransaction: 'Não foi possível cancelar a transação',
    noPaymentID: 'Sem ID de Pagamento',
    paymentCreationFailed: 'A criação do pagamento falhou. Deseja cancelar esta transação?',
    sessionExpired: 'Sessão expirada. Por favor, faça login novamente.',
    errorVerifying: 'Erro ao Verificar',
    couldNotVerifyPaymentStatus: 'Não foi possível verificar o status do pagamento',
    errorDetails: 'Detalhes do Erro',
    details: 'Detalhes',
    unknownError: 'Erro desconhecido',
    noDetailsAvailable: 'Nenhum detalhe disponível',
    paymentConfirmed: 'Pagamento Confirmado',
    paymentConfirmedBalanceUpdated: 'Seu pagamento foi confirmado e seu saldo foi atualizado!',
    paymentFailed: 'Pagamento Falhou',
    paymentFailedOrExpired: 'Seu pagamento {status}. Por favor, tente novamente.',
    paymentStatus: 'Status do Pagamento',
    currentStatus: 'Status atual: {status}',
    couldNotVerifyStatus: 'Não foi possível verificar o status',
    networkError: 'Erro de Rede',
    couldNotConnectToServer: 'Não foi possível conectar ao servidor. Por favor, verifique sua conexão com a internet.',
    loadingHistory: 'Carregando histórico...',
    noTransactions: 'Sem Transações',
    noTransactionsYet: 'Você ainda não tem transações',
    noPendingTransactions: 'Nenhuma transação pendente',
    noSuccessfulTransactions: 'Nenhuma transação bem-sucedida',
    noFailedTransactions: 'Nenhuma transação falhada',
    pay: 'Pagar',
    verify: 'Verificar',
    viewTechnicalDetails: 'Ver Detalhes Técnicos',
    
    // Tournaments Page
    tournamentsTitle: 'Torneios',
    availableGames: 'Jogos Disponíveis',
    distributionOfRewards: 'Distribuição de Recompensas',
    winner: 'Vencedor',
    prizeFund: 'Fundo de Prêmios',
    onlyUseCommissionsOrChallenges: 'Use apenas MXI de Comissões ou Desafios para participar de torneios',
    waitingTournaments: 'Torneios em Espera',
    code: 'Código',
    players: 'Jogadores',
    prize: 'Prêmio',
    full: 'Cheio',
    createNewTournament: 'Criar Novo Torneio',
    tournamentLimitReached: 'Limite de Torneios Alcançado',
    maxTournamentsReached: 'Número máximo de torneios abertos alcançado para este jogo',
    joinTournament: 'Entrar no Torneio',
    entryFee: 'Taxa de Entrada',
    join: 'Entrar',
    create: 'Criar',
    joiningGame: 'Entrando no jogo...',
    creatingTournament: 'Criando torneio...',
    selectPlayers: 'Selecionar Jogadores',
    asFirstPlayerChoosePlayers: 'Como primeiro jogador, escolha quantos jogadores participarão deste torneio',
    createTournamentOf: 'Torneio de {{count}} Jogadores',
    participateFor: 'Participar por {{fee}} MXI',
    
    // Game Lobby
    invalidSession: 'Sessão inválida',
    sessionCancelled: 'Sessão Cancelada',
    sessionWasCancelled: 'A sessão foi cancelada',
    removedFromSession: 'Removido da Sessão',
    youWereRemovedFromSession: 'Você foi removido da sessão',
    waitingForPlayers: 'Aguardando Jogadores',
    leavingGameWarning: 'Sair do Jogo?',
    leavingGameWarningMessage: 'Tem certeza de que deseja sair? Sua taxa de entrada será reembolsada.',
    
    // Risks Tab Content - NEW CONTENT
    risksIntro: 'Investir em MXI representa uma oportunidade inovadora dentro de um ecossistema projetado para o crescimento real, mas também envolve riscos prejudiciais que todo investidor deve considerar de forma responsável. MXI promove a transparência, por isso detalhamos os fatores-chave que podem influenciar a rentabilidade presente e futura do projeto.',
    risk1Title: '1. Risco de Volatilidade do Mercado',
    risk1Description: 'O mercado cripto é altamente volátil. Embora o MXI integre um modelo tokenômico híbrido que busca estabilidade através de vesting diário, mecanismos de liquidez e recompensas escaláveis, o preço pode flutuar significativamente devido a condições globais, sentimento do mercado ou eventos inesperados. O valor projetado de lançamento (3 USDT) é uma estimativa, não uma garantia.',
    risk2Title: '2. Risco Tecnológico',
    risk2Description: 'Apesar de o MXI incorporar segurança quântica pós-quântica e arquitetura avançada, nenhum ecossistema digital está completamente livre de vulnerabilidades. Falhas em protocolos, ataques externos ou novas ameaças tecnológicas poderiam afetar a operacionalidade. A implementação quântica minimiza cenários futuros, mas não elimina os riscos 100%.',
    risk3Title: '3. Risco de Execução do Projeto',
    risk3Description: 'MXI está em fase de prevenção e, como todo projeto em desenvolvimento, depende da execução correta do plano técnico, dos tempos de implementação, da adoção comunitária e da consolidação de alianças estratégicas. Atrasos ou reestruturações podem impactar metas e projeções.',
    risk4Title: '4. Risco Regulatório',
    risk4Description: 'O ambiente regulatório global em relação aos criptoativos está mudando. Mudanças nas leis de países-chave, maiores exigências de conformidade ou restrições a exchanges podem influenciar a liquidez, acessibilidade ou preço do token.',
    risk5Title: '5. Risco de Liquidez',
    risk5Description: 'Embora o MXI integre um modelo de liquidez progressivo e ferramentas que incentivam a retenção (vesting diário, recompensas, referências), nas fases iniciais a liquidez pode ser limitada. Isso poderia dificultar vendas imediatas ao preço desejado.',
    risk6Title: '6. Risco de Adoção do Ecossistema',
    risk6Description: 'O potencial do MXI cresce à medida que a comunidade se fortalece e o uso dentro do ecossistema aumenta (cartão, créditos, ferramentas para empreendedores, Marketplaces, Launchpad, energia, expansão global, etc.). Uma adoção mais lenta poderia prolongar os tempos de apreciação do token.',
    risk7Title: '7. Risco Competitivo',
    risk7Description: 'MXI compete em um mercado onde existem projetos altamente posicionados (BTC, ETH, SOL, ADA). Embora o modelo híbrido, o vesting dinâmico e a segurança quântica representem vantagens diferenciais, os avanços dos concorrentes poderiam afetar a participação de mercado potencial.',
    risk8Title: '8. Risco de Dependência Comunitária',
    risk8Description: 'MXI se baseia em um princípio fundamental: se a comunidade cresce, todos crescem. Isso significa que parte do sucesso depende da participação, compromisso e expansão de usuários, emissores de projetos, empreendedores e investidores. A baixa participação limitaria as projeções globais.',
    risk9Title: '9. Risco de Investimento Antecipado',
    risk9Description: 'Como em toda prevenção, os investidores adquirem o token antes que o ecossistema esteja completamente implantado. Embora isso ofereça vantagens de preço (0.04 / 0.07 / 0.10 USDT), também traz a incerteza natural das fases iniciais.',
    
    // Additional translations for untranslated pages
    ambassadorButtonTitle: 'Embaixadores MXI',
    ambassadorButtonSubtitle: 'Ganhe bônus por suas referências',
    vestingAndPerformance: 'Vesting e Rendimento',
    performanceProjected: 'Rendimento Projetado',
    phaseInfo: 'Fase {{phase}} • 1 MXI = ${{price}} USDT',
    perHour: 'Por Hora',
    per7Days: 'Por 7 Dias',
    per1Month: 'Por 1 Mês (30 dias)',
    untilLaunch: 'Até o Lançamento',
    daysRemaining: '{{days}} dias restantes',
    monthlyMaximum: 'Máximo Mensal (3%)',
    basedOnPurchased: 'Baseado em {{amount}} MXI comprados',
    balanceBlocked: 'Saldo Bloqueado',
    vestingCannotBeWithdrawn: 'O saldo de vesting não pode ser retirado até que a moeda seja lançada oficialmente.',
    monthlyYield: 'Rendimento Mensal',
    calculationBase: 'Base de Cálculo',
    onlyPurchasedMXI: 'Apenas MXI Comprado',
    update: 'Atualização',
    everySecond: 'A Cada Segundo',
    currentPhaseLabel: 'Fase Atual',
    mxiPrice: 'Preço MXI',
    separateBalances: 'Saldos Separados (Não geram vesting)',
    doesNotGenerateVesting: 'Não gera rendimento de vesting',
    monthlyProgress: 'Progresso Mensal (3% máx.)',
    nearMonthlyLimit: 'Perto do limite mensal de 3%',
    accumulatedTotalYield: 'Rendimento Acumulado Total',
    generatingPerSecondValue: 'Gerando {{rate}} MXI por segundo',
    previousAccumulated: 'Acumulado Anterior',
    noMXIInVesting: 'Não há MXI em vesting. Apenas o MXI comprado diretamente gera rendimento de vesting.',
    miningRate: 'Taxa de mineração: 0.005% por hora do seu MXI comprado. Apenas o MXI comprado diretamente gera rendimento de vesting. As comissões NÃO geram vesting. Para reivindicar seu MXI minerado, você precisa de 5 referências ativas, 10 dias de associação e aprovação KYC. Lembre-se de que para vesting você deve ter 10 referências ativas e será desbloqueado assim que o token for lançado e listado nas exchanges.',
    shareReferralCodeMessage: 'Junte-se ao Pool MXI com meu código de referência: {{code}}\n\nGanhe tokens MXI e obtenha recompensas!',
    copiedToClipboard: 'Código de referência copiado para a área de transferência!',
    yourReferrals: 'Suas Referências',
    totalEarned: 'Total Ganho',
    allCommissionsInMXI: 'Todas as comissões são gerenciadas internamente em MXI',
    withdrawToMXIBalance: 'Retirar para Saldo MXI',
    transferCommissionsToMainBalance: 'Transfira suas comissões para seu saldo principal de MXI para usá-las em compras e outras funções.',
    withdrawToBalance: 'Retirar para Saldo',
    amountToWithdraw: 'Valor a Retirar (MXI)',
    minimum50MXI: 'Mínimo 50 MXI',
    availableAmount: 'Disponível: {{amount}} MXI',
    requirements: 'Requisitos:',
    activeReferrals5: '5 referências ativas ({{count}}/5)',
    minimum50MXIRequired: 'Mínimo 50 MXI',
    shareYourReferralCode: 'Compartilhe seu código de referência com amigos',
    howReferralsWork: 'Como Funcionam as Referências',
    earn5PercentMXILevel1: 'Ganhe 5% em MXI de referências de Nível 1',
    earn2PercentMXILevel2: 'Ganhe 2% em MXI de referências de Nível 2',
    earn1PercentMXILevel3: 'Ganhe 1% em MXI de referências de Nível 3',
    activeReferralsNote: '* Referências ativas são aquelas que fizeram pelo menos uma compra de 50 USDT ou mais',
    invalidAmount: 'Valor Inválido',
    pleaseEnterValidAmount: 'Por favor, digite um valor válido',
    insufficientBalanceOnly: 'Você só tem {{available}} MXI disponíveis de comissões',
    requirementsNotMetTitle: 'Requisitos Não Atendidos',
    need5ActiveReferralsMessage: 'Você precisa de 5 referências ativas que compraram o mínimo de MXI.\n\nAtualmente você tem: {{count}} referências ativas',
    confirmWithdrawToBalance: 'Confirmar Retirada para Saldo MXI',
    confirmWithdrawToBalanceMessage: 'Deseja transferir {{amount}} MXI de comissões para seu saldo principal?\n\nIsso permitirá que você use esses MXI para compras e outras funções.',
    withdrawalSuccessful: 'Retirada Bem-sucedida',
    transferredToMainBalance: '{{amount}} MXI foram transferidos para seu saldo principal',
    failedToCompleteWithdrawal: 'Falha ao completar a retirada',
    unexpectedError: 'Ocorreu um erro inesperado',
    networkTRC20: 'As retiradas serão processadas em USDT pela rede TRC20 (Tron)',
    walletAddressTRC20: 'Endereço da Carteira USDT (TRC20)',
    enterTRC20WalletAddress: 'Digite seu endereço de carteira USDT TRC20 (Tron)',
    activeReferrals7Required: '7 Referências Ativas necessárias ({{count}}/7)',
    activeReferralsGeneral5: '5 Referências Ativas para retiradas gerais ({{count}}/5)',
    activeReferralsVesting7: '7 Referências Ativas para retiradas de vesting ({{count}}/7)',
    vestingGenerates3Percent: 'O vesting gera 3% mensal apenas sobre MXI comprado diretamente',
    verifyWalletAddressCarefully: 'Verifique se seu endereço de carteira está correto e compatível com a rede TRC20 (Tron)',
    loadingAmbassadorData: 'Carregando dados de embaixador...',
    thisMayTakeFewSeconds: 'Isso pode levar alguns segundos',
    couldNotLoadInformation: 'Não foi possível carregar as informações',
    pleaseTryAgain: 'Por favor, tente novamente',
    retry: 'Tentar Novamente',
    goBack: 'Voltar',
    yourCurrentLevelTitle: 'Seu Nível Atual',
    levelRequirement: 'Requisito: {{amount}} USDT',
    notAchievedAnyLevel: 'Você ainda não alcançou nenhum nível',
    needValidPurchases: 'Você precisa de {{amount}} USDT em compras válidas de referências de Nível 1',
    validPurchasesAccumulated: 'Compras Válidas Acumuladas',
    progressToNextLevelTitle: 'Progresso para o Próximo Nível',
    nextLevel: 'Próximo Nível',
    withdrawn: 'Retirado',
    requirementsMustBeMet: 'Ter o nível totalmente alcançado',
    mustHaveKYCApproved: 'Deve ter KYC aprovado',
    mustHavePersonalPurchase: 'Deve ter mínimo 1 compra pessoal',
    withdrawalMethodTRC20: 'Método de retirada: USDT TRC20 apenas',
    bonusesAdditionalToCommission: 'Os bônus são adicionais aos 5% de comissão por referências',
    allBonusesCumulative: 'Todos os bônus são cumulativos',
    onlyLevel1Purchases: 'Apenas compras de referências diretas (Nível 1) contam',
    minimumPerPurchase: 'Valor mínimo por compra: 50 USDT',
    onlyPresalePurchases: 'Apenas compras de pré-venda pagas em USDT',
    adminWillProcess: 'O administrador processará sua retirada em 24-48 horas',
    updatedAt: 'Atualizado: {{time}}',
    showingCachedData: 'Mostrando dados em cache, atualizando...',
    showingCachedDataError: 'Mostrando dados em cache (erro ao atualizar)',
    showingCachedDataOnly: 'Mostrando dados em cache',
    loadingFundraisingData: 'Carregando dados de arrecadação...',
    updated: 'Atualizado',
    totalRaised: 'Total Arrecadado',
    mxiBreakdown: 'Detalhamento de MXI',
    purchases: 'Compras',
    challenges: 'Desafios',
    totalFundraisingProject: 'Arrecadação Total do Projeto',
    presaleProgress: 'Progresso da pré-venda MXI',
    presaleStartDate: 'Início da Pré-venda',
    presaleEndDate: 'Finalização da Pré-venda',
    fundraisingBreakdown: 'Detalhamento da Arrecadação',
    purchasedMXI: 'MXI Comprados',
    totalMXISold: 'Total de MXI vendidos (inclui pagamentos de usuários e vendas manuais)',
    transactions: 'transações',
    transaction: 'transação',
    generalProgressLabel: 'Progresso Geral',
    mxiDistributionBreakdown: 'Detalhamento de MXI Entregue',
    directPurchases: 'Compras Diretas',
    mxiAcquiredViaUSDT: 'MXI adquirido através de pagamentos em USDT. Os usuários recebem MXI de acordo com o preço da fase atual.',
    ofTotal: 'do total',
    referralCommissions: 'Comissões de Referências',
    mxiGeneratedByReferrals: 'MXI gerado pelo sistema de referências (3% nível 1, 2% nível 2, 1% nível 3). Calculado automaticamente quando as referências fazem compras.',
    challengesAndTournaments: 'Desafios e Torneios',
    mxiWonInTournamentsDesc: 'MXI ganho em torneios e desafios. Requer 5 referências ativas para poder retirar.',
    vestingLocked: 'Vesting (Bloqueado)',
    mxiGeneratedByVestingSystem: 'MXI gerado pelo sistema de vesting/yield. Bloqueado até a data de lançamento oficial do MXI.',
    commissionsAndPrizesGenerated: 'As comissões, prêmios e vesting são gerados como incentivos adicionais do ecossistema MXI.',
    thisMetricShowsProgress: 'Esta métrica mostra o progresso total da arrecadação do projeto MXI. Inclui todas as compras de MXI confirmadas. O objetivo máximo é de 17,500,000 USDT para o desenvolvimento completo do ecossistema (3 fases de pré-venda).',
    lastUpdate: 'Última atualização: {{time}} (Refresh #{{count}})',
    fundraisingMilestones: 'Marcos de Arrecadação',
    phase1Milestone: 'Fase 1 - 3.33M USDT (0.40 USDT/MXI)',
    phase2Milestone: 'Fase 2 - 9.17M USDT (0.70 USDT/MXI)',
    phase3Milestone: 'Fase 3 - 17.5M USDT (1.00 USDT/MXI)',
    backToHome: 'Voltar ao Início',
    adminDashboard: 'Painel de Administração',
    welcomeAdmin: 'Bem-vindo, {{name}}',
    dangerZone: 'ZONA DE PERIGO',
    dangerZoneDescription: 'Reinicia todos os contadores de MXI para 0 (INCLUINDO O ADMINISTRADOR). As relações de referências serão preservadas. Esta ação é IRREVERSÍVEL.',
    resetAll: 'Reiniciar Tudo',
    presaleMetrics: 'Métricas de Pré-venda',
    totalSold: 'Total Vendido',
    totalMembers: 'Total de Membros',
    progress: 'Progresso',
    users: 'Usuários',
    active: 'Ativo',
    totalUSDT: 'Total USDT',
    totalMXI: 'Total MXI',
    quickActions: 'Ações Rápidas',
    manualVerifications: 'Verificações Manuais',
    advancedManagement: 'Gestão Avançada',
    creditManualPayment: 'Creditar Pagamento Manual',
    approveKYC: 'Aprovar KYC',
    withdrawals: 'Retiradas',
    supportMessages: 'Mensagens de Suporte',
    basicUsers: 'Usuários Básicos',
    vestingAnalytics: 'Análise de Vesting',
    deleteAccounts: 'Excluir Contas',
    ambassadorBonuses: 'Bônus de Embaixadores',
    resetSystemTitle: 'Reiniciar Todo o Sistema?',
    resetSystemMessage: 'Esta ação é IRREVERSÍVEL e reiniciará todos os contadores para 0 (INCLUINDO O ADMINISTRADOR):',
    allBalancesReset: 'Todos os saldos MXI e USDT serão definidos como 0 (incluindo admin)',
    allCommissionsDeleted: 'Todas as comissões serão excluídas',
    allContributionsDeleted: 'Todas as contribuições serão excluídas',
    allWithdrawalsDeleted: 'Todas as retiradas serão excluídas',
    allPaymentsDeleted: 'Todos os pagamentos e pedidos serão excluídos',
    presaleMetricsReset: 'As métricas de pré-venda serão reiniciadas para 0',
    allVestingDeleted: 'Todo o vesting será excluído',
    adminBalanceReset: 'O saldo do administrador também será reiniciado para 0',
    referralRelationsPreserved: 'As relações de referências SERÃO PRESERVADAS',
    typeResetToConfirm: 'Digite "RESETAR" para confirmar:',
    confirmReset: 'Confirmar Reset',
    mustTypeReset: 'Você deve digitar "RESETAR" para confirmar',
    systemReset: 'Sistema Reiniciado',
    systemResetSuccess: 'A página será recarregada para atualizar os dados.',
    updateComplete: 'Atualização Completa',
    allDataUpdated: 'Todos os dados foram atualizados. O saldo do administrador agora é 0.',
    resetError: 'Erro ao reiniciar o sistema',
    accessDenied: 'Acesso Negado',
    noAdminPermissions: 'Você não tem permissões de administrador',
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
