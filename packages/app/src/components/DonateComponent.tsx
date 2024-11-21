import { useCallback, useMemo, useState } from 'react';
import { Image, View } from 'react-native';
import { Box, HStack, Link, Text, VStack } from 'native-base';
import { useAccount, useNetwork } from 'wagmi';
import { useParams } from 'react-router-native';
import Decimal from 'decimal.js';
import { waitForTransaction } from '@wagmi/core';
import { TransactionReceipt } from 'viem';
import { isEmpty } from 'lodash';
import moment from 'moment';

import RoundedButton from './RoundedButton';
import { useScreenSize } from '../theme/hooks';

import BaseModal from './modals/BaseModal';
import { getDonateStyles } from '../utils';
import { useContractCalls, useGetTokenPrice } from '../hooks';
import { Collective } from '../models/models';
import { useGetTokenBalance } from '../hooks/useGetTokenBalance';
import { acceptablePriceImpact, Frequency, GDEnvTokens, SupportedNetwork } from '../models/constants';
import { InfoIconOrange } from '../assets';
import { SwapRouteState, useSwapRoute } from '../hooks/useSwapRoute';
import { useApproveSwapTokenCallback } from '../hooks/useApproveSwapTokenCallback';

import { useToken, useTokenList } from '../hooks/useTokenList';
import { formatDecimalStringInput } from '../lib/formatDecimalStringInput';
import useCrossNavigate from '../routes/useCrossNavigate';
import FrequencySelector from './DonateFrequency';
import NumberInput from './NumberInput';
import { ApproveTokenImg, PhoneImg, StreamWarning, ThankYouImg } from '../assets';

interface DonateComponentProps {
  collective: Collective;
}

const PriceImpact = ({ priceImpact }: any) => (
  <Text color="goodOrange.500" maxWidth="90%">
    <Text>Due to low liquidity between your chosen currency and GoodDollar, </Text>
    <Text variant="bold" fontWeight="700">
      your donation amount will reduce by {priceImpact?.toFixed(2)}%{' '}
    </Text>
    when swapped.
  </Text>
);

const WarningExplanation = ({ type }: any) => (
  <Text color="goodOrange.500" maxWidth="90%">
    <Text>
      {type === 'liquidity'
        ? 'There is not enough liquidity between your chosen currency and GoodDollar to proceed.'
        : 'There is not enough balance in your wallet to proceed.'}
    </Text>
  </Text>
);

const warningProps = {
  priceImpact: {
    title: 'Price impact warning!',
    Explanation: PriceImpact,
    suggestion: ['Proceed, and accept the price slip', 'Select another Donation Currency above'],
    href: 'https://gooddollar.notion.site/How-do-I-buy-GoodDollars-94e821e06f924f6ea739df7db02b5a2d',
  },
  liquidity: {
    title: 'Insufficient liquidity!',
    Explanation: WarningExplanation,
    suggestion: ['Try with another currency', 'Reduce your donation amount'],
    href: 'https://gooddollar.notion.site/How-do-I-buy-GoodDollars-94e821e06f924f6ea739df7db02b5a2d',
  },
  balance: {
    title: 'Insufficient balance!',
    Explanation: WarningExplanation,
    suggestion: ['Reduce your donation amount', 'Try with another currency'],
    href: 'https://gooddollar.notion.site/How-do-I-buy-GoodDollars-94e821e06f924f6ea739df7db02b5a2d',
  },
  noAmount: {
    title: 'Enter an amount above',
  },
};

const shouldWarning = (
  currency: string,
  donorCurrencyBalance: string,
  priceImpact: number | undefined,
  swapRouteStatus: SwapRouteState,
  totalDecimalDonation: Decimal
) => {
  const isNonZeroDonation = totalDecimalDonation.gt(0);
  const isInsufficientBalance =
    isNonZeroDonation && (!donorCurrencyBalance || totalDecimalDonation.gt(donorCurrencyBalance));
  const isInsufficientLiquidity =
    isNonZeroDonation && currency.startsWith('G$') === false && swapRouteStatus === SwapRouteState.NO_ROUTE;
  const isUnacceptablePriceImpact =
    isNonZeroDonation && currency.startsWith('G$') === false && priceImpact
      ? priceImpact > acceptablePriceImpact
      : false;

  return { isNonZeroDonation, isInsufficientBalance, isInsufficientLiquidity, isUnacceptablePriceImpact };
};

const WarningBox = ({ content, explanationProps = {} }: any) => {
  const Explanation = content.Explanation;

  return (
    <HStack space={2} backgroundColor="goodOrange.200" maxWidth="343" paddingY={3} paddingX={2}>
      <Image source={{ uri: InfoIconOrange }} style={{ width: 16, height: 16 }} />
      <VStack space={4} maxWidth="100%">
        <VStack space={1}>
          <Text variant="bold" color="goodOrange.500">
            {content.title}
          </Text>

          {!isEmpty(explanationProps) ? <Explanation {...explanationProps} /> : null}
        </VStack>
        {content.suggestion ? (
          <VStack space={2}>
            <Text variant="bold" color="goodOrange.500">
              You may:
            </Text>
            <VStack space={0}>
              <Text color="goodOrange.500" flexDir="column" display="flex">
                {content.suggestion.map((suggestion: string, index: number) => (
                  <Text key={index}>
                    {index + 1}. {suggestion}
                  </Text>
                ))}
                <Link color="goodOrange.500" href={content.href} isExternal>
                  <Text>3. </Text>
                  <Text textDecorationLine="underline">Purchase and use GoodDollar</Text>
                </Link>
              </Text>
            </VStack>
          </VStack>
        ) : null}
      </VStack>
    </HStack>
  );
};

const DonateComponent = ({ collective }: DonateComponentProps) => {
  const { isDesktopView } = useScreenSize();
  const { id: collectiveId = '0x' } = useParams();

  const { address } = useAccount();
  const { chain } = useNetwork();

  const [completeDonationModalVisible, setCompleteDonationModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [approveSwapModalVisible, setApproveSwapModalVisible] = useState(false);
  const [thankYouModalVisible, setThankYouModalVisible] = useState(false);
  const [startStreamingVisible, setStartStreamingVisible] = useState(false);
  const [estimatedDuration, setEstimatedDuration] = useState<{ duration: number; endDate: string }>({
    duration: 0,
    endDate: '',
  });
  const { price: tokenPrice = 0 } = useGetTokenPrice('G$');
  const [swapValue, setSwapValue] = useState<number | undefined>(undefined);

  const [isDonationComplete, setIsDonationComplete] = useState(false);
  const { navigate } = useCrossNavigate();
  if (isDonationComplete) {
    navigate(`/profile/${address}`);
  }

  const [frequency, setFrequency] = useState<Frequency>(Frequency.OneTime);
  const [streamRate, setRate] = useState(0);
  const [duration, setDuration] = useState(12);
  const [decimalDonationAmount, setDecimalDonationAmount] = useState<any | number>(0);

  const [inputAmount, setInputAmount] = useState<string | undefined>(undefined);

  const tokenList = useTokenList();
  const gdEnvSymbol =
    Object.keys(tokenList).find((key) => {
      if (key.startsWith('G$')) {
        return tokenList[key].address.toLowerCase() === collective.rewardToken.toLowerCase();
      } else return false;
    }) || 'G$';

  const GDToken = GDEnvTokens[gdEnvSymbol];

  const currencyOptions: { value: string; label: string }[] = useMemo(() => {
    let options = Object.keys(tokenList).reduce<Array<{ value: string; label: string }>>((acc, key) => {
      if (!key.startsWith('G$') || key === gdEnvSymbol) {
        acc.push({ value: key, label: key });
      }
      return acc;
    }, []);

    return options;
  }, [tokenList, gdEnvSymbol]);

  const [currency, setCurrency] = useState<string>(gdEnvSymbol || 'G$');

  const {
    path: swapPath,
    rawMinimumAmountOut,
    priceImpact,
    status: swapRouteStatus,
  } = useSwapRoute(currency, GDToken, decimalDonationAmount, duration);

  const { handleApproveToken, isRequireApprove } = useApproveSwapTokenCallback(
    currency,
    decimalDonationAmount,
    duration,
    (value: boolean) => setApproveSwapModalVisible(value),
    collectiveId as `0x${string}`
  );
  const approvalNotReady = handleApproveToken === undefined && currency.startsWith('G$') === false;
  // const approvalNotReady = false;

  const { supportFlowWithSwap, supportFlow, supportSingleTransferAndCall, supportSingleWithSwap } = useContractCalls(
    collectiveId,
    currency,
    decimalDonationAmount,
    duration,
    frequency,
    (error) => setErrorMessage(error),
    (value: boolean) => setCompleteDonationModalVisible(value),
    (value: boolean) => setThankYouModalVisible(value),
    (value: boolean) => setIsDonationComplete(value),
    rawMinimumAmountOut,
    swapPath
  );

  const [confirmNoAmount, setConfirmNoAmount] = useState(false);

  const token = useToken(currency);
  // const currencyDecimals = token.decimals;
  const donorCurrencyBalance = useGetTokenBalance(token.address, address, chain?.id, true);

  const totalDecimalDonation = new Decimal(duration * decimalDonationAmount);
  // const totalDonationFormatted = totalDecimalDonation.toDecimalPlaces(currencyDecimals, Decimal.ROUND_DOWN).toString();

  const { isNonZeroDonation, isInsufficientBalance, isInsufficientLiquidity, isUnacceptablePriceImpact } =
    shouldWarning(currency, donorCurrencyBalance, priceImpact, swapRouteStatus, totalDecimalDonation);

  const handleStreamingWarning = useCallback(async () => {
    if (startStreamingVisible) {
      setStartStreamingVisible(false);
      if (currency.startsWith('G$')) {
        return await supportFlow();
      } else {
        return await supportFlowWithSwap();
      }
    }

    setStartStreamingVisible(true);
  }, [currency, startStreamingVisible, supportFlow, supportFlowWithSwap]);

  const handleDonate = useCallback(async () => {
    if (!isNonZeroDonation) {
      setConfirmNoAmount(true);
      return;
    }

    if (frequency === Frequency.OneTime) {
      if (currency.startsWith('G$')) {
        return await supportSingleTransferAndCall();
      } else {
        return await supportSingleWithSwap();
      }
    } else if (currency.startsWith('G$')) {
      handleStreamingWarning();
    }

    let isApproveSuccess = isRequireApprove === false;

    if (isRequireApprove) {
      const txHash = await handleApproveToken?.();
      if (txHash === undefined) {
        return;
      }
      let txReceipt: TransactionReceipt | undefined;
      try {
        txReceipt = await waitForTransaction({
          chainId: chain?.id,
          confirmations: 1,
          hash: txHash,
          timeout: 1000 * 60 * 5,
        });
        isApproveSuccess = txReceipt?.status === 'success';
      } catch (error) {
        setErrorMessage(
          'Something went wrong: Your token approval transaction was not confirmed within the timeout period.'
        );
      }
    }
    if (isApproveSuccess) {
      // await supportFlowWithSwap();
      handleStreamingWarning();
    }
  }, [
    chain?.id,
    currency,
    frequency,
    isRequireApprove,
    handleApproveToken,
    handleStreamingWarning,
    // supportFlow,
    // supportFlowWithSwap,
    supportSingleTransferAndCall,
    supportSingleWithSwap,
    isNonZeroDonation,
  ]);

  const donateStyles = useMemo(() => {
    return getDonateStyles({
      noAddress: !address,
      invalidChain: !(chain?.id && chain.id in SupportedNetwork),
      insufficientLiquidity: isInsufficientLiquidity,
      priceImpact: isUnacceptablePriceImpact,
      insufficientBalance: isInsufficientBalance,
      approvalNotReady: approvalNotReady,
      isZeroDonation: !isNonZeroDonation,
      default: true,
    });
  }, [
    address,
    chain,
    isInsufficientLiquidity,
    isUnacceptablePriceImpact,
    isInsufficientBalance,
    approvalNotReady,
    isNonZeroDonation,
  ]);

  const { buttonCopy, buttonBgColor, buttonTextColor } = donateStyles;

  const onReset = () => {
    setInputAmount(undefined);
    setEstimatedDuration({ duration: 0, endDate: '' });
    setSwapValue(undefined);
  };

  const onChangeCurrency = (value: string) => {
    setCurrency(value);
    onReset();
  };

  const estimateDuration = useCallback((estDuration: number) => {
    const estimatedEndDate = moment().add(estDuration, 'months').format('DD.MM.YY HH:mm');

    setEstimatedDuration({ duration: estDuration, endDate: estimatedEndDate });
  }, []);

  const onChangeAmount = useCallback(
    (v: string) => {
      setInputAmount(v);

      if (![''].includes(v)) setConfirmNoAmount(false);
      if (v.substring(v.length - 1) === '.' || v === '0') return;

      setDecimalDonationAmount(formatDecimalStringInput(v));

      if (frequency === Frequency.Monthly && currency.includes('G$')) {
        const estDuration = parseFloat(donorCurrencyBalance) / parseFloat(v);
        estimateDuration(estDuration);
      } else if (frequency === Frequency.Monthly) {
        const estDuration = parseFloat(v) / streamRate;
        estimateDuration(estDuration);

        const gdValue = parseFloat(v) / tokenPrice;
        setSwapValue(gdValue);
      }
    },
    [currency, donorCurrencyBalance, streamRate, estimateDuration, frequency, tokenPrice]
  );

  const onChangeFrequency = (value: string) => {
    if (value === Frequency.OneTime) {
      setDuration(1);
    }
    setFrequency(value as Frequency);
    onReset();
  };

  const onChangeRate = (value: string) => {
    setRate(Number(value));

    const estDuration = parseFloat(decimalDonationAmount) / parseFloat(value);
    estimateDuration(estDuration);
  };

  const onCloseErrorModal = () => setErrorMessage(undefined);
  const onCloseThankYouModal = () => {
    setThankYouModalVisible(false);
    navigate(`/profile/${address}`);
  };

  const isWarning = isInsufficientBalance || isInsufficientLiquidity || isUnacceptablePriceImpact || confirmNoAmount;

  return (
    <Box height="100vh">
      {/* todo: find simpler solution to render different modals */}
      <BaseModal
        type="error"
        openModal={!!errorMessage}
        setOpenModal={onCloseErrorModal}
        errorMessage={errorMessage ?? ''}
        onConfirm={onCloseErrorModal}
      />
      <BaseModal
        openModal={approveSwapModalVisible}
        setOpenModal={setApproveSwapModalVisible}
        title="APPROVE TOKEN SWAP"
        paragraphs={[
          "To approve the exchange from your donation currency to this GoodCollective's currency, sign with yourwallet.",
        ]}
        image={ApproveTokenImg}
      />
      <BaseModal
        openModal={completeDonationModalVisible}
        setOpenModal={setCompleteDonationModalVisible}
        title="COMPLETE YOUR DONATION"
        paragraphs={['To complete your donation, sign with your wallet.']}
        image={PhoneImg}
      />
      <BaseModal
        openModal={thankYouModalVisible}
        setOpenModal={onCloseThankYouModal}
        title="thank you!"
        paragraphs={[
          `You have just donated to ${collective?.ipfs?.name} GoodCollective!`,
          frequency !== Frequency.OneTime
            ? `To stop your donation, visit the ${collective?.ipfs?.name} GoodCollective page.`
            : undefined,
        ]}
        confirmButtonText="GO TO PROFILE"
        image={ThankYouImg}
      />
      <BaseModal
        openModal={startStreamingVisible}
        setOpenModal={() => setStartStreamingVisible(false)}
        title="STREAMS CONTINUE UNLESS YOU STOP THEM!"
        paragraphs={[
          'The stream will end if your GoodDollar wallet balance is depleted.',
          'You may cancel the stream at any time by visiting the GoodCollective page or Superfluid dApp.',
        ]}
        onConfirm={handleStreamingWarning}
        confirmButtonText="OK, Continue"
        image={StreamWarning}
      />

      <VStack space={6}>
        {/* Modals */}
        <VStack space={2}>
          <Text variant="bold" fontSize="xl">
            Donate
          </Text>
          <VStack space={0}>
            <Text>Support {collective.ipfs.name}</Text>
            <Text>by donating any amount you want either one time or streaming at a monthly rate.</Text>
          </VStack>
        </VStack>
        <VStack space={8} backgroundColor="white" shadow="1" padding={4} borderRadius={16}>
          <HStack space={8}>
            {/* Donation frequency */}
            <VStack space={2} w="320" maxW="320">
              <VStack space={2}>
                <Text variant="bold" fontSize="lg">
                  Donation Frequency
                </Text>
                <Text>How do you want to donate</Text>
              </VStack>
              <FrequencySelector onSelect={onChangeFrequency} />

              {frequency === Frequency.Monthly ? (
                <Text>
                  <Text>Your donation will be streamed using Superfluid. </Text>
                  <Link href="https://gooddollar.notion.site/How-does-Superfluid-work-ab31eaaef75f4e3db36db615fcb578d1">
                    <Text color="goodGrey.500" textDecorationLine="underline">
                      How does Superfluid work?
                    </Text>
                  </Link>
                </Text>
              ) : (
                <Box minWidth="100%" />
              )}
            </VStack>
            {/* Amount and token */}
            <VStack space={2} maxW="320">
              <VStack space={2}>
                <Text variant="bold" fontSize="lg">
                  How much?
                </Text>
                <Text>You can donate using any token on Celo.</Text>
              </VStack>
              <NumberInput
                type="token"
                value={currency}
                defaultInput={inputAmount?.toString()}
                onSelect={onChangeCurrency}
                onChangeAmount={onChangeAmount}
                options={currencyOptions}
                isWarning={isWarning}
              />
            </VStack>

            <VStack space={2} minW="343">
              {frequency !== 'One-Time' && !currency.includes('G$') ? (
                <>
                  <VStack space={2}>
                    <Text variant="bold" fontSize="lg">
                      At what streaming rate?
                    </Text>
                    <Box p={2} />
                  </VStack>
                  <NumberInput
                    type="duration"
                    value={currency}
                    defaultInput={streamRate.toString()}
                    onSelect={onChangeCurrency}
                    onChangeAmount={onChangeRate}
                  />{' '}
                </>
              ) : null}
              {frequency !== 'One-Time' && isNonZeroDonation && !isEmpty(estimatedDuration.endDate) ? (
                <VStack space={2} width="100%">
                  <HStack justifyContent="space-between">
                    <Text variant="bold" color="goodGrey.500" fontSize="lg">
                      Estimated duration:
                    </Text>
                    <Text variant="bold" color="goodPurple.500" fontSize="lg">
                      {parseFloat(estimatedDuration.duration.toFixed(2))} months
                    </Text>
                  </HStack>
                  <HStack justifyContent="space-between">
                    <Text variant="bold" color="goodGrey.500" fontSize="lg">
                      Estimated End Date:
                    </Text>
                    <Text variant="bold" color="goodPurple.500" fontSize="lg">
                      {estimatedDuration.endDate}
                    </Text>
                  </HStack>
                </VStack>
              ) : null}
            </VStack>
          </HStack>
          {frequency !== 'One-Time' && currency === 'CELO' && isNonZeroDonation && swapValue ? (
            <VStack space={2} maxW="320">
              <Text variant="bold" fontSize="lg">
                Total Donation Swap Amount:
              </Text>
              <VStack space="0">
                <Text variant="bold" color="goodPurple.400" fontSize="2xl" textAlign="right">
                  CELO {decimalDonationAmount}
                </Text>
                <Text textAlign="right" fontSize="sm " color="goodGrey.25">
                  =
                  <Text variant="bold" fontWeight="700">
                    {' '}
                    G${' '}
                  </Text>
                  {swapValue.toFixed(4)}
                </Text>
              </VStack>
            </VStack>
          ) : null}
        </VStack>

        <View style={{ gap: 16, flex: 1, zIndex: -1 }}>
          {isWarning
            ? Object.keys(warningProps).map((key) => {
                const whichWarning =
                  key === 'priceImpact'
                    ? isUnacceptablePriceImpact
                    : key === 'balance'
                    ? isInsufficientBalance
                    : key === 'noAmount'
                    ? !isNonZeroDonation && confirmNoAmount
                    : isInsufficientLiquidity;
                return whichWarning ? (
                  <WarningBox
                    key={key}
                    explanationProps={priceImpact}
                    content={warningProps[key as keyof typeof warningProps]}
                  />
                ) : null;
              })
            : null}
          {isNonZeroDonation ? (
            <VStack space={2} maxW="700">
              <Text variant="bold">You are about to begin a donation stream</Text>
              <Text>
                Pressing “Confirm” will begin the donation streaming process. You will need to confirm using your
                connected wallet. You may be asked to sign multiple transactions.
              </Text>
            </VStack>
          ) : null}

          <RoundedButton
            maxWidth={isDesktopView ? 343 : undefined}
            title={buttonCopy}
            backgroundColor={buttonBgColor}
            color={buttonTextColor}
            fontSize={18}
            seeType={false}
            onPress={handleDonate}
            isLoading={swapRouteStatus === SwapRouteState.LOADING}
            disabled={
              (currency.startsWith('G$') === false && swapRouteStatus !== SwapRouteState.READY) ||
              address === undefined ||
              chain?.id === undefined ||
              !(chain.id in SupportedNetwork) ||
              approvalNotReady
            }
          />
        </View>
      </VStack>
    </Box>
  );
};

export default DonateComponent;
