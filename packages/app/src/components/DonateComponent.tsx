import { useCallback, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { InterRegular, InterSemiBold, InterSmall } from '../utils/webFonts';
import RoundedButton from './RoundedButton';
import CompleteDonationModal from './modals/CompleteDonationModal';
import { Colors } from '../utils/colors';
import { Link, useMediaQuery } from 'native-base';
import Dropdown from './Dropdown';
import { getDonateStyles, getFrequencyPlural } from '../utils';
import { useContractCalls, useGetTokenPrice } from '../hooks';
import { useAccount, useNetwork } from 'wagmi';
import { Collective } from '../models/models';
import { useGetTokenBalance } from '../hooks/useGetTokenBalance';
import { acceptablePriceImpact, Frequency, frequencyOptions, GDEnvTokens, SupportedNetwork } from '../models/constants';
import { InfoIconOrange } from '../assets';
import { useParams } from 'react-router-native';
import Decimal from 'decimal.js';
import { formatFiatCurrency } from '../lib/formatFiatCurrency';
import ErrorModal from './modals/ErrorModal';
import { SwapRouteState, useSwapRoute } from '../hooks/useSwapRoute';
import { useApproveSwapTokenCallback } from '../hooks/useApproveSwapTokenCallback';
import ApproveSwapModal from './modals/ApproveSwapModal';
import { waitForTransaction } from '@wagmi/core';
import { TransactionReceipt } from 'viem';
import { useToken, useTokenList } from '../hooks/useTokenList';
import { formatDecimalStringInput } from '../lib/formatDecimalStringInput';
import ThankYouModal from './modals/ThankYouModal';
import useCrossNavigate from '../routes/useCrossNavigate';

interface DonateComponentProps {
  collective: Collective;
}

function DonateComponent({ collective }: DonateComponentProps) {
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 920,
  });
  const { id: collectiveId = '0x' } = useParams();

  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const [completeDonationModalVisible, setCompleteDonationModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [approveSwapModalVisible, setApproveSwapModalVisible] = useState(false);
  const [thankYouModalVisible, setThankYouModalVisible] = useState(false);

  const [isDonationComplete, setIsDonationComplete] = useState(false);
  const { navigate } = useCrossNavigate();
  if (isDonationComplete) {
    navigate(`/profile/${address}`);
  }

  const [frequency, setFrequency] = useState<Frequency>(Frequency.Monthly);
  const [duration, setDuration] = useState(12);
  const [decimalDonationAmount, setDecimalDonationAmount] = useState(0);

  const tokenList = useTokenList();
  const gdEnvSymbol =
    Object.keys(tokenList).find((key) => {
      if (key.startsWith('G$')) {
        return tokenList[key].address.toLowerCase() === collective.rewardToken.toLowerCase();
      } else return false;
    }) || 'G$';

  const GDToken = GDEnvTokens[gdEnvSymbol];

  const currencyOptions: { value: string; label: string }[] = useMemo(() => {
    let options = Object.keys(tokenList).reduce((acc, key) => {
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

  const handleDonate = useCallback(async () => {
    if (frequency === Frequency.OneTime) {
      if (currency.startsWith('G$')) {
        return await supportSingleTransferAndCall();
      } else {
        return await supportSingleWithSwap();
      }
    } else if (currency.startsWith('G$')) {
      return await supportFlow();
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
      await supportFlowWithSwap();
    }
  }, [
    chain?.id,
    currency,
    frequency,
    isRequireApprove,
    handleApproveToken,
    supportFlow,
    supportFlowWithSwap,
    supportSingleTransferAndCall,
    supportSingleWithSwap,
  ]);

  const token = useToken(currency);
  const currencyDecimals = token.decimals;
  const donorCurrencyBalance = useGetTokenBalance(token.address, address, chain?.id, true);

  const totalDecimalDonation = new Decimal(duration * decimalDonationAmount);
  const totalDonationFormatted = totalDecimalDonation.toDecimalPlaces(currencyDecimals, Decimal.ROUND_DOWN).toString();

  const isNonZeroDonation = totalDecimalDonation.gt(0);
  const isInsufficientBalance =
    isNonZeroDonation && (!donorCurrencyBalance || totalDecimalDonation.gt(donorCurrencyBalance));
  const isInsufficientLiquidity =
    isNonZeroDonation && currency.startsWith('G$') === false && swapRouteStatus === SwapRouteState.NO_ROUTE;
  const isUnacceptablePriceImpact =
    isNonZeroDonation && currency.startsWith('G$') === false && priceImpact
      ? priceImpact > acceptablePriceImpact
      : false;

  const { price } = useGetTokenPrice(currency);
  const donationAmountUsdValue = price ? formatFiatCurrency(decimalDonationAmount * price) : undefined;
  const totalDonationUsdValue = price ? formatFiatCurrency(totalDecimalDonation.mul(price).toNumber()) : undefined;

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

  const onChangeCurrency = (value: string) => setCurrency(value);
  const onChangeAmount = (value: string) => setDecimalDonationAmount(formatDecimalStringInput(value));
  const onChangeFrequency = useCallback((value: string) => {
    if (value === Frequency.OneTime) {
      setDuration(1);
    }
    setFrequency(value as Frequency);
  }, []);
  const onChangeDuration = (value: string) => setDuration(Number(value));
  const onCloseErrorModal = () => setErrorMessage(undefined);

  return (
    <View style={[styles.body, isDesktopResolution && styles.bodyDesktop]}>
      <View>
        <Text style={styles.title}>Donate</Text>
        <Text style={styles.description}>
          Support {collective.ipfs.name}{' '}
          {isDesktopResolution && (
            <>
              <br />
            </>
          )}
          by donating any amount you want either one time or on a recurring monthly basis.
        </Text>
      </View>
      <View style={styles.divider} />

      {!isDesktopResolution && (
        <>
          <View>
            <Text style={styles.title}>Donation Currency:</Text>
            <Text style={styles.description}>You can donate using any cryptocurrency. </Text>
          </View>
          <View>
            <View style={styles.row}>
              <Dropdown value={currency} onSelect={onChangeCurrency} options={currencyOptions} />
              <View style={styles.form}>
                <View style={styles.upperForm}>
                  <Text style={styles.headerLabel}>{currency}</Text>
                  <TextInput
                    keyboardType="decimal-pad"
                    multiline={false}
                    placeholder={'0.00'}
                    style={styles.subHeading}
                    maxLength={7}
                    onChangeText={onChangeAmount}
                  />
                </View>
                <View style={styles.divider} />
                <Text style={styles.lowerText}>{donationAmountUsdValue} USD</Text>
              </View>
            </View>
          </View>
        </>
      )}

      {isDesktopResolution && (
        <View style={styles.donationCurrencyHeader}>
          <View style={styles.donationAction}>
            <View style={styles.actionBox}>
              <Text style={styles.title}>Donation Currency:</Text>
              <Text style={styles.description}>You can donate using any cryptocurrency. </Text>
            </View>
            <View>
              <View style={styles.row}>
                <Dropdown value={currency} onSelect={onChangeCurrency} options={currencyOptions} />
                <View style={styles.form}>
                  <View style={styles.upperForm}>
                    <Text style={styles.headerLabel}>{currency}</Text>
                    <TextInput
                      keyboardType="decimal-pad"
                      multiline={false}
                      placeholder={'0.00'}
                      style={styles.subHeading}
                      maxLength={7}
                      onChangeText={onChangeAmount}
                    />
                  </View>
                  <View style={styles.divider} />
                  <Text style={styles.lowerText}>{donationAmountUsdValue} USD</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.donationAction}>
            <View style={styles.actionBox}>
              <Text style={styles.title}>Donation Frequency</Text>
              <Text style={styles.description}>
                How often do you want to donate this {!isDesktopResolution && <br />} amount?
              </Text>
            </View>
            <Dropdown value={frequency} onSelect={onChangeFrequency} options={frequencyOptions} />
          </View>
          <View>
            {frequency !== 'One-Time' && (
              <View style={[styles.row, styles.actionBox, styles.desktopActionBox]}>
                <Text style={styles.title}>For How Long: </Text>
                <View style={[styles.frequencyDetails, styles.desktopFrequencyDetails]}>
                  <TextInput
                    keyboardType="decimal-pad"
                    multiline={false}
                    placeholder={duration.toString()}
                    value={duration.toString()}
                    style={styles.durationInput}
                    maxLength={2}
                    onChangeText={onChangeDuration}
                  />

                  <Text style={[styles.durationLabel]}>{getFrequencyPlural(frequency as Frequency)}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.frequencyWrapper}>
        <>
          {!isDesktopResolution && (
            <>
              <Dropdown value={frequency} onSelect={onChangeFrequency} options={frequencyOptions} />
              {frequency !== 'One-Time' && (
                <View style={[styles.row, styles.actionBox, { alignItems: 'center', marginTop: 19, marginBottom: 12 }]}>
                  <Text style={[styles.title, { marginBottom: 0 }]}>For How Long: </Text>
                  <View style={styles.frequencyDetails}>
                    <TextInput
                      keyboardType="decimal-pad"
                      multiline={false}
                      placeholder={duration.toString()}
                      value={duration.toString()}
                      style={styles.durationInput}
                      maxLength={2}
                      onChangeText={onChangeDuration}
                    />

                    <Text style={[styles.durationLabel]}>{getFrequencyPlural(frequency)}</Text>
                  </View>
                </View>
              )}
            </>
          )}
        </>

        {isConnected && (
          <View style={styles.actionBox}>
            <View style={styles.reviewContainer}>
              <View>
                <Text style={styles.title}>Review Your Donation</Text>
                <Text style={styles.reviewDesc}>
                  Your donation will be made in GoodDollars, the currency in use by this GoodCollective.{'\n'}
                  If recurrent, your donation will be streamed using Superfluid.{'\n'}
                  Pressing “Confirm” will trigger your donation.{'\n'}
                  <Link
                    href={'https://gooddollar.notion.site/How-does-Superfluid-work-ab31eaaef75f4e3db36db615fcb578d1'}
                    isExternal>
                    <Text style={[styles.reviewDesc, { textDecorationLine: 'underline' }]}>
                      How does Superfluid work?
                    </Text>
                  </Link>
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewSubtitle}>Donation Amount:</Text>
                <View>
                  <Text style={[styles.subHeading, { textAlign: 'right' }]}>
                    {currency} <Text style={styles.headerLabel}>{decimalDonationAmount}</Text>
                  </Text>
                  <Text style={styles.descriptionLabel}>{donationAmountUsdValue} USD</Text>
                </View>
              </View>

              {frequency !== 'One-Time' && (
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewSubtitle}>Donation Duration:</Text>
                  <View>
                    <Text style={[styles.subHeading, { textAlign: 'right' }]}>
                      {duration} <Text style={styles.headerLabel}>{getFrequencyPlural(frequency)}</Text>
                    </Text>
                  </View>
                </View>
              )}
              {frequency !== Frequency.OneTime && (
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewSubtitle}>Total Amount:</Text>
                  <View>
                    <Text style={[styles.subHeading, { textAlign: 'right' }]}>
                      {currency} <Text style={styles.headerLabel}>{totalDonationFormatted}</Text>
                    </Text>
                    <Text style={styles.descriptionLabel}>{totalDonationUsdValue} USD</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.actionBox}>
              {isInsufficientLiquidity && (
                <View style={styles.warningView}>
                  <Image source={InfoIconOrange} style={styles.infoIcon} />
                  <View style={styles.actionBox}>
                    <View style={styles.actionHeader}>
                      <Text style={styles.warningTitle}>Insufficient liquidity!</Text>
                      <Text style={styles.warningLine}>
                        There is not enough liquidity between your chosen currency and GoodDollar to proceed.
                      </Text>
                    </View>
                    <View style={styles.actionContent}>
                      <Text style={styles.warningTitle}>You may:</Text>
                      <Text style={styles.warningLine}>
                        1. Try with another currency {'\n'}
                        2. Reduce your donation amount {'\n'}
                        <Link
                          style={styles.warningLine}
                          href={
                            'https://gooddollar.notion.site/How-do-I-buy-GoodDollars-94e821e06f924f6ea739df7db02b5a2d'
                          }
                          isExternal>
                          3. Purchase and use GoodDollar {'\n'}
                        </Link>
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {isInsufficientBalance && (
                <View style={styles.warningView}>
                  <Image source={{ uri: InfoIconOrange }} style={styles.infoIcon} />
                  <View style={styles.actionBox}>
                    <View style={styles.actionHeader}>
                      <Text style={styles.warningTitle}>Insufficient balance!</Text>
                      <Text style={styles.warningLine}>There is not enough balance in your wallet to proceed.</Text>
                    </View>
                    <View style={styles.actionContent}>
                      <Text style={styles.warningTitle}>You may:</Text>
                      <Text style={styles.warningLine}>
                        1. Reduce your donation amount {'\n'}
                        2. Try with another currency {'\n'}
                        <Link
                          style={styles.warningLine}
                          href={
                            'https://gooddollar.notion.site/How-do-I-buy-GoodDollars-94e821e06f924f6ea739df7db02b5a2d'
                          }
                          isExternal>
                          3. Purchase and use GoodDollar {'\n'}
                        </Link>
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {isUnacceptablePriceImpact && (
                <View style={styles.warningView}>
                  <Image source={{ uri: InfoIconOrange }} style={styles.infoIcon} />
                  <View style={styles.actionBox}>
                    <View style={styles.actionHeader}>
                      <Text style={styles.warningTitle}>Price impace warning!</Text>
                      <Text style={styles.warningLine}>
                        Due to low liquidity between your chosen currency and GoodDollar,
                        <Text style={{ ...InterSemiBold }}>
                          {' '}
                          your donation amount will reduce by {priceImpact?.toFixed(2)}%{' '}
                        </Text>
                        when swapped.
                      </Text>
                    </View>
                    <View style={styles.actionContent}>
                      <Text style={styles.warningTitle}>You may:</Text>
                      <Text style={styles.warningLine}>
                        1. Proceed and accept the price slip {'\n'}
                        2. Select another Donation Currency above {'\n'}
                        <Link
                          style={styles.warningLine}
                          href={
                            'https://gooddollar.notion.site/How-do-I-buy-GoodDollars-94e821e06f924f6ea739df7db02b5a2d'
                          }
                          isExternal>
                          3. Purchase and use GoodDollar {'\n'}
                        </Link>
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              <Text style={styles.lastDesc}>
                Pressing “Confirm” will begin the donation streaming process. You will need to confirm using your
                connected wallet. You may be asked to sign multiple transactions.
              </Text>
            </View>
          </View>
        )}

        <RoundedButton
          maxWidth={isDesktopResolution ? 343 : undefined}
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
            approvalNotReady ||
            !isNonZeroDonation
          }
        />
      </View>
      <ErrorModal openModal={!!errorMessage} setOpenModal={onCloseErrorModal} message={errorMessage ?? ''} />
      <ApproveSwapModal openModal={approveSwapModalVisible} setOpenModal={setApproveSwapModalVisible} />
      <CompleteDonationModal openModal={completeDonationModalVisible} setOpenModal={setCompleteDonationModalVisible} />
      <ThankYouModal
        openModal={thankYouModalVisible}
        address={address}
        collective={collective.ipfs}
        isStream={frequency !== Frequency.OneTime}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 24,
    paddingBottom: 32,
    paddingTop: 32,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
  },
  bodyDesktop: {
    borderRadius: 30,
    marginTop: 12,
  },
  title: {
    lineHeight: 25,
    fontSize: 20,
    textAlign: 'left',
    ...InterSemiBold,
    marginBottom: 16,
  },
  description: {
    color: Colors.gray[200],
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    ...InterSmall,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.gray[600],
  },
  form: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
  upperForm: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
    paddingLeft: '25%',
  },
  actionContent: {
    gap: 8,
  },
  actionBox: {
    gap: 16,
    flex: 1,
    zIndex: -1,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  desktopActionBox: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  headerLabel: {
    fontSize: 18,
    lineHeight: 27,
    color: Colors.gray[100],
    ...InterSmall,
  },
  subHeading: {
    fontSize: 20,
    lineHeight: 27,
    ...InterSemiBold,
    color: Colors.gray[100],
    paddingLeft: 10,
    width: 159,
  },
  lowerText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: Colors.gray[900],

    ...InterRegular,
  },
  frequencyDetails: {
    height: 32,
    gap: 8,
    backgroundColor: Colors.purple[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Colors.gray[600],
    borderBottomWidth: 1,
    flex: 1,
    flexDirection: 'row',
  },
  desktopFrequencyDetails: {
    maxHeight: 59,
  },
  durationInput: {
    fontSize: 18,
    lineHeight: 27,
    ...InterSemiBold,
    width: '20%',
    color: Colors.purple[400],
    textAlign: 'center',
  },
  durationLabel: {
    ...InterSmall,
    fontSize: 18,
    lineHeight: 27,
    color: Colors.purple[400],
    textAlignVertical: 'bottom',
  },
  downIcon: {
    width: 24,
    height: 24,
  },
  descriptionLabel: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'right',
    color: Colors.gray[200],
    ...InterSmall,
  },
  lastDesc: {
    color: Colors.gray[200],
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    ...InterSemiBold,
  },
  warningView: {
    width: '100%',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: Colors.orange[100],
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoIcon: {
    width: 16,
    height: 16,
  },
  actionHeader: {
    gap: 4,
    width: '100%',
  },
  warningTitle: {
    ...InterSemiBold,
    color: Colors.orange[300],
    fontSize: 14,
    lineHeight: 21,
  },
  warningLine: {
    ...InterSmall,
    color: Colors.orange[300],
    fontSize: 14,
    lineHeight: 21,
  },
  reviewContainer: {
    width: '100%',
    gap: 24,
    padding: 8,
    borderRadius: 4,
    backgroundColor: Colors.green[400],
  },
  reviewSubtitle: {
    fontSize: 18,
    lineHeight: 27,
    color: Colors.green[300],
    ...InterSemiBold,
  },
  reviewRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewDesc: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.gray[100],
    ...InterSmall,
  },
  italic: { fontStyle: 'italic' },
  frequencyWrapper: { gap: 17, zIndex: -1 },
  donationAction: { width: 'auto', flexGrow: 1 },
  donationCurrencyHeader: { flexDirection: 'row', width: 'auto', gap: 20 },
});

export default DonateComponent;
