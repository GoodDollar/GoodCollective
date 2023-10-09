import React, { useEffect, useState } from 'react';
// import Header from './Header';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import ImpactButton from './ImpactButton';
import { InterRegular, InterSemiBold, InterSmall } from '../utils/webFonts';
import RoundedButton from './RoundedButton';
import { InfoIconOrange } from '../@constants/ColorTypeIcons';
// import useCrossNavigate from '../routes/useCrossNavigate';
import CompleteDonationModal from './CompleteDonationModal';
import { Colors } from '../utils/colors';
import { Link, useMediaQuery } from 'native-base';
import Dropdown from './Dropdown';
import { getButtonBGC, getButtonText, getButtonTextColor, getFrequencyTime, getTotalAmount } from '../utils';
import { useGetTokenPrice } from '../hooks/useGetTokenPrice';
import { useContractCalls } from '../hooks/useContractCalls';
interface DonateComponentProps {
  walletConected: boolean;
  insufficientLiquidity: boolean;
  priceImpace: boolean;
  insufficientBalance: boolean;
  currentCollective: {
    name: string;
    description: string;
  };
}

const currencyOptions = [
  { value: 'G$', label: 'G$' },
  { value: 'CELO', label: 'CELO' },
  { value: 'cUSD', label: 'cUSD' },
  { value: 'RECY', label: 'RECY' },
  { value: 'WBTC', label: 'WBTC' },
  { value: 'WETH', label: 'WETH' },
];

const frequencyOptions = [
  { value: 'One-Time', label: 'One-Time' },
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Yearly', label: 'Yearly' },
];

function DonateComponent({
  walletConected,
  insufficientLiquidity,
  priceImpace,
  insufficientBalance,
  currentCollective,
}: DonateComponentProps) {
  // const { navigate } = useCrossNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [currency, setCurrency] = useState('G$');
  const [frequency, setFrequency] = useState('One-Time');
  const [duration, setDuration] = useState(1);
  const [amount, setAmount] = useState(0);
  const [usdValue, setUsdValue] = useState<number>();
  const { getPrice } = useGetTokenPrice();
  const { supportFlowWithSwap, supportFlow } = useContractCalls();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tokenMapping = {
    CELO: '0x471EcE3750Da237f93B8E339c536989b8978a438',
    cUSD: '0x765de816845861e75a25fca122bb6898b8b1282a',
    WBTC: '0xD629eb00dEced2a080B7EC630eF6aC117e614f1b',
    // Add other tokens here if needed
  };

  useEffect(() => {
    if (currency === 'WBTC') {
      getPrice('0xD629eb00dEced2a080B7EC630eF6aC117e614f1b').then((res: any) => {
        setUsdValue(res * amount);
      });
    }
    if (currency === 'cUSD') {
      getPrice('0x765de816845861e75a25fca122bb6898b8b1282a').then((res: any) => {
        setUsdValue(res * amount);
      });
    }
    if (currency === 'CELO') {
      getPrice('0x471EcE3750Da237f93B8E339c536989b8978a438').then((res: any) => {
        setUsdValue(res * amount);
      });
    }
    if (currency === 'G$') {
      setUsdValue(0.00018672442844237 * amount);
    }
  }, [amount, currency, getPrice, usdValue, setUsdValue]);

  const [isDesktopResolution] = useMediaQuery({
    minWidth: 612,
  });

  return (
    <View style={[styles.body, isDesktopResolution && styles.bodyDesktop]}>
      <View>
        <Text style={styles.title}>Donate</Text>
        <Text style={styles.description}>
          Support {currentCollective.name}{' '}
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
              <Dropdown value={currency} onSelect={(value: string) => setCurrency(value)} options={currencyOptions} />
              <View style={styles.form}>
                <View style={styles.upperForm}>
                  <Text style={styles.headerLabel}>{currency}</Text>
                  <TextInput
                    keyboardType="decimal-pad"
                    multiline={false}
                    placeholder={'0.00'}
                    style={styles.subHeading}
                    maxLength={7}
                    onChangeText={(value: any) => setAmount(value)}
                  />
                </View>
                <View style={styles.divider} />
                <Text style={styles.lowerText}>{usdValue} USD</Text>
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
                <Dropdown value={currency} onSelect={(value: string) => setCurrency(value)} options={currencyOptions} />
                <View style={styles.form}>
                  <View style={styles.upperForm}>
                    <Text style={styles.headerLabel}>{currency}</Text>
                    <TextInput
                      keyboardType="decimal-pad"
                      multiline={false}
                      placeholder={'0.00'}
                      style={styles.subHeading}
                      maxLength={7}
                      onChangeText={(value: any) => setAmount(value)}
                    />
                  </View>
                  <View style={styles.divider} />
                  <Text style={styles.lowerText}>{usdValue} USD</Text>
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
            <Dropdown value={frequency} onSelect={(value: string) => setFrequency(value)} options={frequencyOptions} />
          </View>
          <View>
            {frequency !== 'One-Time' && (
              <View style={[styles.row, styles.actionBox, isDesktopResolution && { flex: 1, flexDirection: 'column' }]}>
                <Text style={styles.title}>For How Long: </Text>
                <View
                  style={[
                    styles.frequencyDetails,
                    isDesktopResolution && {
                      flex: 1,
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                  ]}>
                  <TextInput
                    keyboardType="decimal-pad"
                    multiline={false}
                    placeholder={'0'}
                    style={styles.durationInput}
                    maxLength={2}
                    onChangeText={(value: string) => setDuration(Number(value))}
                  />

                  <Text style={[styles.durationInput, styles.durationLabel]}>{getFrequencyTime(frequency)}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.frecuencyWrapper}>
        <>
          {!isDesktopResolution && (
            <>
              <Dropdown
                value={frequency}
                onSelect={(value: string) => setFrequency(value)}
                options={frequencyOptions}
              />
              {frequency !== 'One-Time' && (
                <View style={[styles.row, styles.actionBox]}>
                  <Text style={styles.title}>For How Long: </Text>
                  <View style={styles.frequencyDetails}>
                    <TextInput
                      keyboardType="decimal-pad"
                      multiline={false}
                      placeholder={'0'}
                      style={styles.durationInput}
                      maxLength={2}
                      onChangeText={(value: any) => setDuration(value)}
                    />

                    <Text style={[styles.durationInput, styles.durationLabel]}>{getFrequencyTime(frequency)}</Text>
                  </View>
                </View>
              )}
            </>
          )}
        </>

        {walletConected && (
          <View style={styles.actionBox}>
            <View style={styles.reviewContainer}>
              <View>
                <Text style={styles.title}>Review Your Donation</Text>
                <Text style={styles.reviewDesc}>
                  Your donation will be made in GoodDollars, the currency in use by this GoodCollective. {'\n'}
                  Your donation will be streamed using Superfluid. {'\n'}
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
                    {currency} <Text style={styles.headerLabel}>{amount}</Text>
                  </Text>
                  <Text style={styles.descriptionLabel}>{usdValue} USD</Text>
                </View>
              </View>

              {frequency != 'One-Time' && (
                <View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewSubtitle}>Donation Duration:</Text>
                    <View>
                      <Text style={[styles.subHeading, { textAlign: 'right' }]}>
                        {duration} <Text style={styles.headerLabel}>{getFrequencyTime(frequency)}</Text>
                      </Text>
                    </View>
                  </View>

                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewSubtitle}>Total Amount:</Text>
                    <View>
                      <Text style={[styles.subHeading, { textAlign: 'right' }]}>
                        {currency} <Text style={styles.headerLabel}>{getTotalAmount(duration, amount)}</Text>
                      </Text>
                      <Text style={styles.descriptionLabel}>{usdValue} USD</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.actionBox}>
              {insufficientLiquidity && (
                <View style={styles.warningView}>
                  <Image source={{ uri: InfoIconOrange }} style={styles.infoIcon} />
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

              {insufficientLiquidity && (
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

              {priceImpace && (
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

        <TouchableOpacity>
          <RoundedButton
            title={getButtonText(insufficientLiquidity, priceImpace, insufficientBalance)}
            backgroundColor={getButtonBGC(insufficientLiquidity, priceImpace, insufficientBalance)}
            color={getButtonTextColor(insufficientLiquidity, priceImpace, insufficientBalance)}
            fontSize={18}
            seeType={false}
            onPress={() => {
              if (currency === 'G$') {
                supportFlow(window.location.pathname.slice('/donate/'.length));
              } else {
                supportFlowWithSwap();
              }
            }}
          />
        </TouchableOpacity>
      </View>
      <CompleteDonationModal openModal={modalVisible} setOpenModal={setModalVisible} />
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
  },
  title: {
    lineHeight: 25,
    fontSize: 20,
    textAlign: 'left',
    ...InterSemiBold,
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
    gap: 8,
    backgroundColor: Colors.purple[100],
    paddingTop: 2,
    justifyContent: 'center',
    borderColor: Colors.gray[600],
    borderBottomWidth: 1,
    flex: 1,
    flexDirection: 'row',
  },
  durationInput: {
    fontSize: 18,
    lineHeight: 27,
    ...InterSemiBold,
    // textAlign: 'right',
    width: '20%',
    color: Colors.purple[400],
    textAlign: 'center',
  },
  durationLabel: {
    ...InterSmall,
    textAlign: 'left',
    width: 'auto',
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
  frecuencyWrapper: { gap: 17, zIndex: -1 },
  donationAction: { width: 'auto', flexGrow: 1 },
  donationCurrencyHeader: { flexDirection: 'row', width: 'auto', gap: 20 },
});

export default DonateComponent;
