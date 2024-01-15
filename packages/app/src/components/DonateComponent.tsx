import { useCallback, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { InterRegular, InterSemiBold, InterSmall } from '../utils/webFonts';
import RoundedButton from './RoundedButton';
import CompleteDonationModal from './CompleteDonationModal';
import { Colors } from '../utils/colors';
import { Link, useMediaQuery } from 'native-base';
import Dropdown from './Dropdown';
import { getDonateStyles, getFrequencyPlural } from '../utils';
import { useContractCalls, useGetTokenPrice } from '../hooks';
import { useAccount, useNetwork } from 'wagmi';
import { IpfsCollective } from '../models/models';
import { useGetTokenBalance } from '../hooks/useGetTokenBalance';
import { acceptablePriceImpact, Frequency, frequencyOptions, SupportedNetwork } from '../models/constants';
import { InfoIconOrange } from '../assets';
import { useLocation } from 'react-router-native';
import Decimal from 'decimal.js';
import { formatFiatCurrency } from '../lib/formatFiatCurrency';
import ErrorModal from './ErrorModal';
import { SwapRouteState, useSwapRoute } from '../hooks/useSwapRoute';
import { useApproveSwapTokenCallback } from '../hooks/useApproveSwapTokenCallback';
import ApproveSwapModal from './ApproveSwapModal';
import { waitForTransaction } from '@wagmi/core';
import { TransactionReceipt } from 'viem';
import { useToken, useTokenList } from '../hooks/useTokenList';
import { formatDecimalStringInput } from '../lib/formatDecimalStringInput';

interface DonateComponentProps {
  collective: IpfsCollective;
}

function DonateComponent({ collective }: DonateComponentProps) {
  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });
  const location = useLocation();
  const collectiveId = location.pathname.slice('/donate/'.length);

  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();

  const [completeDonationModalVisible, setCompleteDonationModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [approveSwapModalVisible, setApproveSwapModalVisible] = useState(false);

  const [currency, setCurrency] = useState<string>('G$');
  const [frequency, setFrequency] = useState<Frequency>(Frequency.OneTime);
  const [duration, setDuration] = useState(1);
  const [decimalDonationAmount, setDecimalDonationAmount] = useState(0);

  const tokenList = useTokenList();
  const isOneTime = frequency === Frequency.OneTime;
  const currencyOptions: { value: string; label: string }[] = useMemo(() => {
    let options = Object.keys(tokenList).map((key) => ({
      value: key,
      label: key,
    }));
    if (isOneTime) {
      options = [options.find((option) => option.value === 'G$')!];
    }
    return options;
  }, [tokenList, isOneTime]);

  const {
    path: swapPath,
    rawMinimumAmountOut,
    priceImpact,
    status: swapRouteStatus,
  } = useSwapRoute(currency, decimalDonationAmount, duration);

  const { handleApproveToken } = useApproveSwapTokenCallback(
    currency,
    decimalDonationAmount,
    duration,
    (value: boolean) => setApproveSwapModalVisible(value)
  );
  const approvalNotReady = handleApproveToken === undefined && currency !== 'G$';

  const { supportFlowWithSwap, supportFlow, supportSingleBatch } = useContractCalls(
    collectiveId,
    currency,
    decimalDonationAmount,
    duration,
    frequency,
    (error) => setErrorMessage(error),
    (value: boolean) => setCompleteDonationModalVisible(value),
    rawMinimumAmountOut,
    swapPath
  );

  const handleDonate = useCallback(async () => {
    if (frequency === Frequency.OneTime) {
      return await supportSingleBatch();
    } else if (currency === 'G$') {
      return await supportFlow();
    }
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
    } catch (error) {
      setErrorMessage(
        'Something went wrong: Your token approval transaction was not confirmed within the timeout period.'
      );
    }
    if (txReceipt?.status === 'success') {
      await supportFlowWithSwap();
    }
  }, [chain?.id, currency, frequency, handleApproveToken, supportFlow, supportFlowWithSwap, supportSingleBatch]);

  const currencyDecimals = useToken(currency).decimals;
  const donorCurrencyBalance = useGetTokenBalance(currency, address, chain?.id, true);

  const totalDecimalDonation = new Decimal(duration * decimalDonationAmount);
  const totalDonationFormatted = totalDecimalDonation.toDecimalPlaces(currencyDecimals, Decimal.ROUND_DOWN).toString();

  const isNonZeroDonation = totalDecimalDonation.gt(0);
  const isInsufficientBalance =
    isNonZeroDonation && (!donorCurrencyBalance || totalDecimalDonation.gt(donorCurrencyBalance));
  const isInsufficientLiquidity = isNonZeroDonation && currency !== 'G$' && swapRouteStatus !== SwapRouteState.READY;
  const isUnacceptablePriceImpact =
    isNonZeroDonation && currency !== 'G$' && priceImpact ? priceImpact > acceptablePriceImpact : false;

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
  const onChangeFrequency = (value: string) => {
    if (currency !== 'G$' && value === Frequency.OneTime) {
      setCurrency('G$');
      setDecimalDonationAmount(0);
    }
    setFrequency(value as Frequency);
  };
  const onChangeDuration = (value: string) => setDuration(Number(value));
  const onCloseErrorModal = () => setErrorMessage(undefined);

  return (
    <View style={[styles.body, isDesktopResolution && styles.bodyDesktop]}>
      <View>
        <Text style={styles.title}>Donate</Text>
        <Text style={styles.description}>
          Support {collective.name}{' '}
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
                  Your donation will be made in GoodDollars, the currency in use by this GoodCollective. {'\n'}
                  {Frequency.OneTime
                    ? 'Pressing “Confirm” will trigger your donation.\n'
                    : 'Your donation will be streamed using Superfluid.\n'}
                  <Text style={styles.italic}>
                    <Link
                      style={styles.reviewDesc}
                      href={'https://gooddollar.notion.site/How-does-Superfluid-work-ab31eaaef75f4e3db36db615fcb578d1'}
                      isExternal>
                      How does Superfluid work?
                    </Link>
                  </Text>
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
                        <Text style={{ ...InterSemiBold }}>your donation amount will reduce by 36% </Text>
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
          disabled={
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
