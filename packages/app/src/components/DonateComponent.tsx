import { waitForTransactionReceipt } from '@wagmi/core';
import Decimal from 'decimal.js';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { Box, HStack, Link, Text, useBreakpointValue, VStack } from 'native-base';
import { useCallback, useMemo, useState } from 'react';
import { Image, View } from 'react-native';
import { useParams } from 'react-router-native';
import { TransactionReceipt } from 'viem';
import { useAccount } from 'wagmi';
import { config } from './../config';

import { useScreenSize } from '../theme/hooks';
import RoundedButton from './RoundedButton';

import { InfoIconOrange } from '../assets';
import { useContractCalls, useGetTokenPrice } from '../hooks';
import { useApproveSwapTokenCallback } from '../hooks/useApproveSwapTokenCallback';
import { useGetTokenBalance } from '../hooks/useGetTokenBalance';
import { SwapRouteState, useSwapRoute } from '../hooks/useSwapRoute';
import { useCollectiveFees } from '../hooks/useCollectiveFees';
import { acceptablePriceImpact, Frequency, GDEnvTokens, SupportedNetwork } from '../models/constants';
import { Collective } from '../models/models';
import { getDonateStyles } from '../utils';
import BaseModal from './modals/BaseModal';
import env from '../lib/env'
import { ApproveTokenImg, PhoneImg, StreamWarning, ThankYouImg } from '../assets';
import { useToken, useTokenList } from '../hooks/useTokenList';
import { formatDecimalStringInput } from '../lib/formatDecimalStringInput';
import { formatNumberWithCommas } from '../lib/formatFiatCurrency';
import useCrossNavigate from '../routes/useCrossNavigate';
import FrequencySelector from './DonateFrequency';
import NumberInput from './NumberInput';
type ConfigChainId = (typeof config.chains)[number]['id'];

interface DonateComponentProps {
  collective: Collective;
}

const PriceImpact = ({ priceImpact }: any) => (
  <Text color="goodOrange.500" display="flex" flexWrap="wrap">
    <Text>Due to low liquidity between your chosen currency and GoodDollar, </Text>
    <Text variant="bold" fontWeight="700">
      your donation amount will reduce by {priceImpact?.toFixed(2)}%{' '}
    </Text>
    when swapped.
  </Text>
);

const WarningExplanation = ({ type }: any) => (
  <Text color="goodOrange.500">
    <Text>
      {type === 'liquidity'
        ? 'There is not enough liquidity between your chosen currency and GoodDollar to proceed.'
        : 'There is not enough balance in your wallet to proceed.'}
    </Text>
  </Text>
);
const NetworkExplanation = ({ _type }: any) => (
  <Text color="goodOrange.500">
    <Text>Switch in your wallet to the Celo network</Text>
  </Text>
);

const warningProps = {
  noWallet: {
    title: 'Please connect a wallet to proceed',
  },
  invalidChain: {
    title: 'Unsupported network',
    Explanation: NetworkExplanation,
  },
  priceImpact: {
    title: 'Price impact warning!',
    Explanation: PriceImpact,
    suggestion: ['Proceed, and accept the price impact', 'Select another donation currency above'],
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

const SwapValue = ({ swapValue }: { swapValue: number }) => (
  <Text textAlign="right" fontSize="sm " color="gray.400">
    =
    <Text variant="bold" fontWeight="700">
      {' '}
      G${' '}
    </Text>
    {formatNumberWithCommas(swapValue.toString(), 2)}
  </Text>
);

const WarningBox = ({ content, explanationProps = {} }: any) => {
  const Explanation = content.Explanation;

  return (
    <HStack
      space={2}
      backgroundColor="goodOrange.200"
      maxWidth="500"
      borderRadius={15}
      display={'flex'}
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      paddingY={3}
      paddingX={2}>
      <Image source={{ uri: InfoIconOrange }} style={{ width: 16, height: 16 }} />
      <VStack space={4} maxWidth="100%">
        <VStack space={1}>
          <Text variant="bold" color="goodOrange.500">
            {content.title}
          </Text>

          {Explanation ? <Explanation {...explanationProps} /> : null}
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
                {content.href && (
                  <Link color="goodOrange.500" href={content.href} isExternal>
                    <Text>{content.suggestion.length + 1}. </Text>
                    <Text textDecorationLine="underline">Purchase and use GoodDollar</Text>
                  </Link>
                )}
              </Text>
            </VStack>
          </VStack>
        ) : null}
      </VStack>
    </HStack>
  );
};

const DonateComponent = ({ collective }: DonateComponentProps) => {
  const { id: collectiveId = '0x' } = useParams();

  const { isLargeDesktop } = useScreenSize();
  const { address } = useAccount();
  const { chain } = useAccount();

  const [completeDonationModalVisible, setCompleteDonationModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [approveSwapModalVisible, setApproveSwapModalVisible] = useState(false);
  const [thankYouModalVisible, setThankYouModalVisible] = useState(false);
  const [startStreamingVisible, setStartStreamingVisible] = useState(false);
  const [estimatedDuration, setEstimatedDuration] = useState<{
    duration: number;
    endDate: string;
  }>({
    duration: 0,
    endDate: '',
  });
  const { price: tokenPrice = 0 } = useGetTokenPrice('G$');
  const [isDonationComplete, setIsDonationComplete] = useState(false);
  const [isDonating, setIsDonating] = useState(false);

  const { navigate } = useCrossNavigate();
  if (isDonationComplete) {
    navigate(`/profile/${address}`);
  }

  const [frequency, setFrequency] = useState<Frequency>(Frequency.OneTime);
  const [duration, setDuration] = useState(1);
  const [inputAmount, setInputAmount] = useState<string | undefined>(undefined);

  const tokenList = useTokenList();
  const gdEnvSymbol =
    Object.keys(tokenList).find((key) => {
      if (key.startsWith('G$')) {
        return tokenList[key].address.toLowerCase() === collective.rewardToken.toLowerCase();
      } else return false;
    }) || 'G$';

  const GDToken = GDEnvTokens[gdEnvSymbol];

  const [currency, setCurrency] = useState<string>(gdEnvSymbol || 'G$');
  const { price: altTokenPrice = 0 } = useGetTokenPrice(currency);

  // Get dynamic fee information from the collective
  const { fees: collectiveFees, loading: feesLoading, error: feesError } = useCollectiveFees(collective.address);

  const decimalDonationAmount = formatDecimalStringInput(inputAmount || '0');

  const container = useBreakpointValue({
    base: {
      paddingLeft: 2,
      paddingRight: 2,
    },
    sm: {
      minWidth: '100%',
      paddingLeft: 2,
      paddingRight: 2,
    },
    md: {
      width: '100%',
      paddingLeft: 4,
      paddingRight: 4,
    },
    xl: {
      maxWidth: '100%',
      paddingLeft: 4,
      paddingRight: 4,
    },
  });

  const direction = useBreakpointValue({
    base: {
      flexDirection: 'column',
    },
    lg: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
  });

  const currencyOptions: { value: string; label: string }[] = useMemo(() => {
    let options = Object.keys(tokenList).reduce<Array<{ value: string; label: string }>>((acc, key) => {
      if (!key.startsWith('G$') || key === gdEnvSymbol) {
        acc.push({ value: key, label: key });
      }
      return acc;
    }, []);

    return options;
  }, [tokenList, gdEnvSymbol]);

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

  const token = useToken(currency);
  const donorCurrencyBalance = useGetTokenBalance(token.address, address, chain?.id, true);

  const totalDecimalDonation = new Decimal(decimalDonationAmount * (currency.includes('G$') ? 1 : Number(duration)));

  const swapValue = currency.includes('G$') ? 0 : (totalDecimalDonation.toNumber() * altTokenPrice) / tokenPrice;

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
    let isApproveSuccess = isRequireApprove === false || currency.startsWith('G$');
    setIsDonating(true);
    try {
      if (isRequireApprove && currency.startsWith('G$') === false) {
        const txHash = await handleApproveToken?.();
        if (txHash === undefined) {
          return;
        }
        let txReceipt: TransactionReceipt | undefined;
        try {
          txReceipt = await waitForTransactionReceipt(config, {
            chainId: chain?.id as ConfigChainId,
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

      if (!isApproveSuccess) {
        return;
      }

      if (frequency === Frequency.OneTime) {
        if (currency.startsWith('G$')) {
          return await supportSingleTransferAndCall();
        } else {
          return await supportSingleWithSwap();
        }
      } else {
        handleStreamingWarning();
      }
    } catch (e) {
      console.error('donation error:', e);
    } finally {
      setIsDonating(false);
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
  ]);

  const isInvalidChain = !(chain?.id && chain.id in SupportedNetwork);
  const isWarning =
    isInsufficientBalance ||
    isInsufficientLiquidity ||
    isUnacceptablePriceImpact ||
    !isNonZeroDonation ||
    isInvalidChain ||
    address === undefined;
  const isOnlyPriceImpactWarning =
    isUnacceptablePriceImpact && !isInsufficientBalance && !isInsufficientLiquidity && isNonZeroDonation;

  const donateStyles = useMemo(() => {
    return getDonateStyles({
      noAddress: !address,
      invalidChain: !(chain?.id && chain.id in SupportedNetwork),
      insufficientLiquidity: isInsufficientLiquidity,
      priceImpact: isOnlyPriceImpactWarning,
      insufficientBalance: isInsufficientBalance,
      approvalNotReady: approvalNotReady,
      isZeroDonation: !isNonZeroDonation,
      default: true,
    });
  }, [
    address,
    chain,
    isInsufficientLiquidity,
    isOnlyPriceImpactWarning,
    isInsufficientBalance,
    approvalNotReady,
    isNonZeroDonation,
  ]);

  const { buttonCopy, buttonBgColor, buttonTextColor } = donateStyles;

  const onReset = () => {
    setInputAmount(undefined);
    setEstimatedDuration({ duration: 0, endDate: '' });
  };

  const onChangeCurrency = (value: string) => {
    setCurrency(value);

    onReset();
  };

  const estimateDuration = useCallback(
    (v: string, altDuration?: number) => {
      if (!currency.includes('G$')) {
        return;
      }

      let estDuration = altDuration ?? 0;

      if (frequency === Frequency.Monthly && !altDuration) {
        estDuration = parseFloat(donorCurrencyBalance) / parseFloat(v);
      }

      const estimatedEndDate = moment().add(estDuration, 'months').format('DD.MM.YY HH:mm');

      setEstimatedDuration({
        duration: estDuration,
        endDate: estimatedEndDate,
      });
    },
    [currency, donorCurrencyBalance, frequency]
  );

  const onChangeRate = (value: string) => {
    setDuration(Number(value));
  };

  const onChangeAmount = useCallback(
    (v: string) => {
      setInputAmount(v);

      if (v.endsWith('.') || ['0', ''].includes(v)) {
        setEstimatedDuration({ duration: 0, endDate: '' });
        return;
      }

      estimateDuration(v);
    },
    [estimateDuration]
  );

  const onChangeFrequency = (value: string) => {
    if (value === Frequency.OneTime) {
      setDuration(1);
    } else setDuration(12);
    setFrequency(value as Frequency);
    onReset();
  };

  const onCloseErrorModal = () => setErrorMessage(undefined);
  const onCloseThankYouModal = () => {
    setThankYouModalVisible(false);
    navigate(`/profile/${address}`);
  };

  return (
    <Box height="100vh" paddingY={8} paddingX={4}>
      {/* todo: find simpler solution to render different modals */}
      <BaseModal
        type="error"
        openModal={!!errorMessage}
        onClose={onCloseErrorModal}
        errorMessage={errorMessage ?? ''}
        onConfirm={onCloseErrorModal}
      />
      <BaseModal
        openModal={approveSwapModalVisible}
        onClose={() => setApproveSwapModalVisible(false)}
        title="APPROVE TOKEN SWAP"
        paragraphs={[
          "To approve the exchange from your donation currency to this GoodCollective's currency, sign with yourwallet.",
        ]}
        image={ApproveTokenImg}
      />
      <BaseModal
        openModal={completeDonationModalVisible}
        onClose={() => setCompleteDonationModalVisible(false)}
        title="COMPLETE YOUR DONATION"
        paragraphs={['To complete your donation, sign with your wallet.']}
        image={PhoneImg}
      />
      <BaseModal
        openModal={thankYouModalVisible}
        onClose={() => navigate(`/collective/${collectiveId}`)}
        onConfirm={onCloseThankYouModal}
        title="thank you!"
        paragraphs={[
          `You have just donated to ${collective?.ipfs?.name} GoodCollective!`,
          frequency !== Frequency.OneTime
            ? `To stop your donation, visit the ${collective?.ipfs?.name} GoodCollective page.`
            : undefined,
        ]}
        confirmButtonText="GO TO PROFILE"
        message="Please be patient! It may take some time for your donation to appear in your profile."
        image={ThankYouImg}
      />
      <BaseModal
        openModal={startStreamingVisible}
        onClose={() => setStartStreamingVisible(false)}
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
        <VStack space={2}>
          <Text variant="bold" fontSize="xl">
            Donate
          </Text>
          <VStack space={0}>
            <Text>Support {collective.ipfs.name}</Text>
            <Text>by donating any amount you want either one time or streaming at a monthly rate.</Text>
          </VStack>
        </VStack>
        <VStack space={8} backgroundColor="white" shadow="1" paddingY={4} borderRadius={16} {...container}>
          <HStack space={8} {...direction}>
            {/* Donation frequency */}
            <VStack space={2} mb={8} flexGrow={0} flexShrink={1} flexBasis={isLargeDesktop ? '30%' : '50%'}>
              <VStack space={2}>
                <Text variant="bold" fontSize="lg">
                  Donation Frequency
                </Text>
                <Text>How do you want to donate ? </Text>
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
                <Box flexGrow={1} />
              )}
            </VStack>

            <VStack space={2} mb={8} zIndex={1}>
              <VStack space={2} zIndex={1}>
                <Text variant="bold" fontSize="lg">
                  How much{frequency !== Frequency.OneTime ? ' per month' : ''}?
                </Text>
                <Text>You can donate using any token on Celo.</Text>
              </VStack>
              <NumberInput
                type="token"
                dropdownValue={currency}
                inputValue={inputAmount}
                onSelect={onChangeCurrency}
                onChangeAmount={onChangeAmount}
                options={currencyOptions}
                isWarning={isWarning}
                withDuration={frequency !== Frequency.OneTime}
              />

              {frequency === Frequency.OneTime && !currency.startsWith('G$') && isNonZeroDonation && swapValue > 0 && (
                <SwapValue swapValue={swapValue} />
              )}
            </VStack>

            <VStack space={2} maxWidth={650}>
              {frequency !== 'One-Time' && !currency.includes('G$') ? (
                <>
                  <VStack space={2}>
                    <Text variant="bold" fontSize="lg">
                      For how many months?
                    </Text>
                    <Text>You can stop the stream at any time.</Text>
                  </VStack>
                  <NumberInput
                    type="number"
                    dropdownValue={currency}
                    inputValue={duration.toString()}
                    onSelect={onChangeCurrency}
                    onChangeAmount={onChangeRate}
                  />
                  {/* Swap value display under duration input */}
                  {!currency.startsWith('G$') && isNonZeroDonation && swapValue > 0 && (
                    <SwapValue swapValue={swapValue} />
                  )}
                </>
              ) : null}
              {currency.includes('G$') &&
              frequency !== 'One-Time' &&
              isNonZeroDonation &&
              !isEmpty(estimatedDuration.endDate) ? (
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

          {/* Fee Information */}
          <VStack space={2} backgroundColor="gray.50" p={2} borderRadius="lg">
            {feesLoading ? (
              <Text fontSize="sm" color="gray.700">
                Loading fee information...
              </Text>
            ) : feesError ? (
              <Text fontSize="sm" color="gray.700">
                Unable to load fee information. Using default fees.
              </Text>
            ) : collectiveFees ? (
              <Text fontSize="sm" color="gray.700">
                All donations incur a{' '}
                <Text fontWeight="bold" color="black">
                  {(collectiveFees.protocolFeeBps / 100).toFixed(1)}%
                </Text>{' '}
                protocol fee, which contributes directly to{' '}
                <Link
                  href={feeDocsLink}
                  _text={{ color: 'blue.500', textDecoration: 'underline' }}>
                  GoodDollar UBI
                </Link>
                .{' '}
                <Text>
                  All donations incur a{' '}
                  <Text fontWeight="bold" color="black">
                    {(collectiveFees.managerFeeBps / 100).toFixed(1)}%
                  </Text>
                </Text>{' '}
                <Link
                  href={env.REACT_APP_FEE_DOCS_LINK}
                  _text={{ color: 'blue.500', textDecoration: 'underline' }}>
                  Manager Fee
                </Link>
                .
              </Text>
            ) : (
              <Text fontSize="sm" color="gray.700">
                All donations incur a{' '}
                <Text fontWeight="bold" color="black">
                  5.0%
                </Text>{' '}
                protocol fee, which contributes directly to{' '}
                <Link
                  href={env.REACT_APP_FEE_DOCS_LINK
                  _text={{ color: 'blue.500', textDecoration: 'underline' }}>
                  GoodDollar UBI
                </Link>
                .{' '}
                <Text>
                  All donations incur a{' '}
                  <Text fontWeight="bold" color="black">
                    3.0%
                  </Text>
                </Text>{' '}
                <Link
                  href={env.REACT_APP_FEE_DOCS_LINK}
                  _text={{ color: 'blue.500', textDecoration: 'underline' }}>
                  Manager Fee
                </Link>
                .
              </Text>
            )}
          </VStack>
        </VStack>

        <View style={{ gap: 16, flex: 1, zIndex: -1 }}>
          {isWarning && address !== undefined
            ? Object.entries(warningProps)
                .filter(([key]) => key !== 'noWallet')
                .map(([key, content]) => {
                  const whichWarning =
                    {
                      priceImpact: isUnacceptablePriceImpact,
                      balance: isInsufficientBalance,
                      noAmount: !isNonZeroDonation,
                      invalidChain: isInvalidChain,
                    }[key] ?? isInsufficientLiquidity;
                  return whichWarning ? (
                    <WarningBox
                      key={key}
                      {...(key === 'priceImpact'
                        ? { explanationProps: { priceImpact } }
                        : { explanationProps: { type: key } })}
                      content={content}
                    />
                  ) : null;
                })
            : null}
          {isNonZeroDonation && !isInvalidChain ? (
            <VStack space={2} maxW="700">
              {!currency.startsWith('G$') ? (
                <Text variant="bold">
                  Your {frequency !== Frequency.OneTime ? 'stream ' : 'donation'} will be made in GoodDollars. You are
                  about to swap and begin a donation stream.
                </Text>
              ) : (
                <Text variant="bold">
                  {frequency === Frequency.OneTime
                    ? 'You are about to make a one-time donation.'
                    : 'You are about to begin a donation stream.'}
                </Text>
              )}
              <Text>
                Pressing "Confirm" will begin the donation {frequency !== Frequency.OneTime ? 'streaming ' : ''}process.
                You will need to confirm using your connected wallet. You may be asked to sign multiple transactions.
              </Text>
            </VStack>
          ) : address === undefined ? (
            <WarningBox content={warningProps.noWallet} />
          ) : null}

          <RoundedButton
            title={buttonCopy}
            backgroundColor={buttonBgColor}
            color={buttonTextColor}
            fontSize={18}
            seeType={false}
            onPress={handleDonate}
            isLoading={swapRouteStatus === SwapRouteState.LOADING || isDonating}
            disabled={
              (currency.startsWith('G$') === false && swapRouteStatus !== SwapRouteState.READY) ||
              approvalNotReady ||
              (isWarning && !isOnlyPriceImpactWarning)
            }
          />
        </View>
      </VStack>
    </Box>
  );
};

export default DonateComponent;
