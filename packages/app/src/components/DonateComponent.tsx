import React, { useState } from 'react';
import Header from './Header';
import { StyleSheet, useWindowDimensions, View, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import ImpactButton from './ImpactButton';
import { InterRegular, InterSemiBold, InterSmall } from '../utils/webFonts';
import { ChevronDownIcon } from '../@constants/ChevronIcons';
import RoundedButton from './RoundedButton';
import { InfoIconOrange } from '../@constants/ColorTypeIcons';
import useCrossNavigate from '../routes/useCrossNavigate';
import CompleteDonationModal from './CompleteDonationModal';
import { Colors } from '../utils/colors';
import { Link } from 'native-base';

function getButtonBGC(insufficientLiquidity: boolean, priceImpace: boolean, insufficientBalance: boolean) {
  if (insufficientLiquidity || insufficientBalance) {
    return Colors.gray[1000];
  } else if (priceImpace) {
    return Colors.orange[100];
  } else {
    return Colors.green[100];
  }
}

function getDropdownBGC(openModal: boolean) {
  if (openModal) {
    return Colors.blue[100];
  } else {
    return Colors.purple[100];
  }
}
function getButtonText(insufficientLiquidity: boolean, priceImpace: boolean, insufficientBalance: boolean) {
  if (insufficientLiquidity) {
    return 'Insufficient liquidity for this trade';
  } else if (priceImpace) {
    return 'Confirm & Swap Anyway';
  } else if (insufficientBalance) {
    return 'Confirm & Swap Anyway';
  } else {
    return 'Confirm';
  }
}
function getButtonTextColor(insufficientLiquidity: boolean, priceImpace: boolean, insufficientBalance: boolean) {
  if (insufficientLiquidity || insufficientBalance) {
    return Colors.gray[300];
  } else if (priceImpace) {
    return Colors.black;
  } else {
    return Colors.green[200];
  }
}

function renderDropdownItemText(current: string, selection: string) {
  if (current == selection) {
    return <Text style={[styles.dropdownText, { ...InterSemiBold }]}>{selection}</Text>;
  } else {
    return <Text style={[styles.dropdownText]}>{selection}</Text>;
  }
}

function getFrequencyTime(frequency: string) {
  switch (frequency) {
    case 'Daily':
      return 'Days';
      break;
    case 'Weekly':
      return 'Weeks';
      break;
    case 'Monthly':
      return 'Months';
      break;
    case 'Yearly':
      return 'Years';
      break;
  }
}

function getTotalAmount(duration: number, amount: number) {
  const total = duration * amount;

  return total;
}

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

function DonateComponent({
  walletConected,
  insufficientLiquidity,
  priceImpace,
  insufficientBalance,
  currentCollective,
}: DonateComponentProps) {
  const [openCurrencyDropdown, setOpenCurrencyDropdown] = useState<boolean>(false);
  const [openFrequencyDropdown, setOpenFrequencyDropdown] = useState<boolean>(false);
  const { navigate } = useCrossNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [currency, setCurrency] = useState('G$');
  const [frequency, setFrequency] = useState('One-Time');
  const [duration, setDuration] = useState(1);
  const [amount, setAmount] = useState(0);

  return (
    <View style={styles.body}>
      <View>
        <Text style={styles.title}>Donate</Text>
        <Text style={styles.description}>
          Support {currentCollective.name} by donating any amount you want either one time or on a recurring monthly
          basis.
        </Text>
      </View>
      <View style={styles.divider}></View>
      <View>
        <Text style={styles.title}>Donation Currency:</Text>
        <Text style={styles.description}>You can donate using any cryptocurrency. </Text>
      </View>
      <View>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.button, styles.row, { backgroundColor: getDropdownBGC(openCurrencyDropdown) }]}
            onPress={() => {
              setOpenCurrencyDropdown(!openCurrencyDropdown);
              setOpenFrequencyDropdown(false);
            }}>
            <Text style={styles.buttonText}>{currency}</Text>
            <Image source={{ uri: ChevronDownIcon }} style={styles.downIcon}></Image>
          </TouchableOpacity>
          <View style={styles.form}>
            <View style={styles.upperForm}>
              <Text style={styles.upperText}>{currency}</Text>
              <TextInput
                keyboardType="decimal-pad"
                multiline={false}
                placeholder={'00.00'}
                style={styles.upperText2}
                maxLength={7}
                onChangeText={(value: any) => setAmount(value)}></TextInput>
            </View>
            <View style={styles.divider}></View>
            <Text style={styles.lowerText}>0.000 USD</Text>
          </View>
        </View>
      </View>

      <View style={{ gap: 17 }}>
        <View style={styles.view16}>
          <Text style={styles.title}>Donation Frequency</Text>
          <Text style={styles.description}>How often do you want to donate this {'\n'} amount?</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.button,
            styles.row,
            {
              width: '100%',
              backgroundColor: getDropdownBGC(openFrequencyDropdown),
            },
          ]}
          onPress={() => {
            setOpenFrequencyDropdown(!openFrequencyDropdown);
            setOpenCurrencyDropdown(false);
          }}>
          <Text style={styles.buttonText}>{frequency}</Text>
          <Image source={{ uri: ChevronDownIcon }} style={styles.downIcon}></Image>
        </TouchableOpacity>

        {/*Not visible at first from here */}
        {frequency != 'One-Time' && (
          <View style={[styles.row, styles.view16]}>
            <Text style={styles.title}>For How Long: </Text>
            <View style={styles.button2}>
              <TextInput
                keyboardType="decimal-pad"
                multiline={false}
                placeholder={'0'}
                style={styles.durationInput}
                maxLength={2}
                onChangeText={(value: any) => setDuration(value)}></TextInput>

              <Text style={[styles.durationInput, styles.durationInput2]}>{getFrequencyTime(frequency)}</Text>
            </View>
          </View>
        )}

        {walletConected && (
          <View style={styles.view16}>
            <View style={styles.reviewContainer}>
              <View>
                <Text style={styles.title}>Review Your Donation</Text>
                <Text style={styles.reviewDesc}>
                  Your donation will be made in GoodDollars, the currency in use by this GoodCollective. {'\n'}
                  Your donation will be streamed using Superfluid. {'\n'}
                  <Text style={{ fontStyle: 'italic' }}>
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
                  <Text style={[styles.upperText2, { textAlign: 'right' }]}>
                    {currency} <Text style={styles.upperText}>{amount}</Text>
                  </Text>
                  <Text style={styles.lowerText2}>~1,000,000 USD</Text>
                </View>
              </View>

              {frequency != 'One-Time' && (
                <View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewSubtitle}>Donation Duration:</Text>
                    <View>
                      <Text style={[styles.upperText2, { textAlign: 'right' }]}>
                        {duration} <Text style={styles.upperText}>{getFrequencyTime(frequency)}</Text>
                      </Text>
                    </View>
                  </View>

                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewSubtitle}>Total Amount:</Text>
                    <View>
                      <Text style={[styles.upperText2, { textAlign: 'right' }]}>
                        {currency} <Text style={styles.upperText}>{getTotalAmount(duration, amount)}</Text>
                      </Text>
                      <Text style={styles.lowerText2}>~1,000,000 USD</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.view16}>
              {insufficientLiquidity && (
                <View style={styles.warningView}>
                  <Image source={{ uri: InfoIconOrange }} style={styles.infoIcon}></Image>
                  <View style={styles.view16}>
                    <View style={styles.view4}>
                      <Text style={styles.warningTitle}>Insufficient liquidity!</Text>
                      <Text style={styles.warningLine}>
                        There is not enough liquidity between your chosen currency and GoodDollar to proceed.
                      </Text>
                    </View>
                    <View style={styles.view8}>
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
                  <Image source={{ uri: InfoIconOrange }} style={styles.infoIcon}></Image>
                  <View style={styles.view16}>
                    <View style={styles.view4}>
                      <Text style={styles.warningTitle}>Insufficient balance!</Text>
                      <Text style={styles.warningLine}>There is not enough balance in your wallet to proceed.</Text>
                    </View>
                    <View style={styles.view8}>
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
                  <Image source={{ uri: InfoIconOrange }} style={styles.infoIcon}></Image>
                  <View style={styles.view16}>
                    <View style={styles.view4}>
                      <Text style={styles.warningTitle}>Price impace warning!</Text>
                      <Text style={styles.warningLine}>
                        Due to low liquidity between your chosen currency and GoodDollar,
                        <Text style={{ ...InterSemiBold }}>your donation amount will reduce by 36% </Text>
                        when swapped.
                      </Text>
                    </View>
                    <View style={styles.view8}>
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
            onPress={() => setModalVisible(!modalVisible)}
          />
        </TouchableOpacity>
      </View>
      {openCurrencyDropdown && (
        <View style={styles.dropdownContainer1}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setCurrency('G$');
              setOpenCurrencyDropdown(false);
            }}>
            {renderDropdownItemText(currency, 'G$')}
          </TouchableOpacity>
          <View style={styles.dropdownSeparator} />

          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setCurrency('CELO');
              setOpenCurrencyDropdown(false);
            }}>
            {renderDropdownItemText(currency, 'CELO')}
          </TouchableOpacity>

          <View style={styles.dropdownSeparator} />
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setCurrency('cUSD');
              setOpenCurrencyDropdown(false);
            }}>
            {renderDropdownItemText(currency, 'cUSD')}
          </TouchableOpacity>
          <View style={styles.dropdownSeparator} />

          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setCurrency('RECY');
              setOpenCurrencyDropdown(false);
            }}>
            {renderDropdownItemText(currency, 'RECY')}
          </TouchableOpacity>

          <View style={styles.dropdownSeparator} />
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setCurrency('WBTC');
              setOpenCurrencyDropdown(false);
            }}>
            {renderDropdownItemText(currency, 'WBTC')}
          </TouchableOpacity>
          <View style={styles.dropdownSeparator} />

          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setCurrency('WETH');
              setOpenCurrencyDropdown(false);
            }}>
            {renderDropdownItemText(currency, 'WETH')}
          </TouchableOpacity>
        </View>
      )}
      {openFrequencyDropdown && (
        <View style={styles.dropdownContainer2}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setFrequency('One-Time');
              setOpenFrequencyDropdown(false);
            }}>
            {renderDropdownItemText(frequency, 'One-Time')}
          </TouchableOpacity>
          <View style={styles.dropdownSeparator} />
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setFrequency('Daily');
              setOpenFrequencyDropdown(false);
            }}>
            <Text style={styles.dropdownText}>{renderDropdownItemText(frequency, 'Daily')}</Text>
          </TouchableOpacity>
          <View style={styles.dropdownSeparator} />
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setFrequency('Weekly');
              setOpenFrequencyDropdown(false);
            }}>
            {renderDropdownItemText(frequency, 'Weekly')}
          </TouchableOpacity>
          <View style={styles.dropdownSeparator} />
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setFrequency('Monthly');
              setOpenFrequencyDropdown(false);
            }}>
            {renderDropdownItemText(frequency, 'Monthly')}
          </TouchableOpacity>
          <View style={styles.dropdownSeparator} />
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setFrequency('Yearly');
              setOpenFrequencyDropdown(false);
            }}>
            {renderDropdownItemText(frequency, 'Yearly')}
          </TouchableOpacity>
        </View>
      )}
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
    width: '70%',
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
  form2: {
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    gap: 8,
  },
  view8: {
    gap: 8,
  },
  view16: {
    gap: 16,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  upperText: {
    fontSize: 18,
    lineHeight: 27,
    color: Colors.gray[100],
    ...InterSmall,
  },
  upperText2: {
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
  button: {
    gap: 2,
    borderRadius: 12,
    padding: 16,
    width: 105,
    height: 59,
    justifyContent: 'space-between',
  },
  button2: {
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
    textAlign: 'right',
    width: '20%',
    color: Colors.purple[400],
  },
  durationInput2: {
    ...InterSmall,
    textAlign: 'left',
    width: 'auto',
  },
  buttonText: {
    color: Colors.purple[400],
    fontSize: 18,
    lineHeight: 27,
    ...InterSemiBold,
  },
  downIcon: {
    width: 24,
    height: 24,
  },
  lowerText2: {
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
  view4: {
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
  dropdownContainer1: {
    height: 'auto',
    width: '26%',
    backgroundColor: Colors.white,
    paddingTop: 10,
    paddingBottom: 10,
    position: 'absolute',
    zIndex: 2,
    top: 310,
    left: 16,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 24,
  },
  dropdownContainer2: {
    height: 'auto',
    width: '92%',
    backgroundColor: Colors.white,
    paddingTop: 10,
    paddingBottom: 10,
    position: 'absolute',
    zIndex: 2,
    top: 500,
    left: 16,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 24,
  },
  dropdownItem: {
    flex: 1,
    padding: 5,
    width: '100%',
    alignItems: 'center',
  },
  dropdownSeparator: {
    width: '100%',
    height: 2,
    backgroundColor: Colors.gray[600],
    marginTop: 5,
    marginBottom: 5,
  },
  dropdownMyProfileText: {
    fontSize: 18,
    marginLeft: 15,
    color: Colors.purple[400],
  },
  dropdownText: {
    ...InterSmall,
    fontSize: 14,
    color: Colors.purple[400],
    textAlign: 'center',
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
});

export default DonateComponent;
