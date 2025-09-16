// removed React Native StyleSheet in favor of plain style objects compatible with NativeBase
import { Colors } from '../../utils/colors';
import { InterRegular, InterSemiBold, InterSmall } from '../../utils/webFonts';

export const welcomeStyles = {
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 48,
    marginBottom: 4,
    ...InterSemiBold,
  },
  logoImage: {
    width: 365,
    height: 50,
    resizeMode: 'contain',
  },
  infoBlock: {
    backgroundColor: Colors.blue[100],
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.purple[100],
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.black,
    textAlign: 'justify',
    ...InterRegular,
  },
  radioBlock: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray[1000],
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  radioButton: {
    marginRight: 12,
    marginTop: 2,
  },
  radioText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.black,
    flex: 1,
    ...InterRegular,
  },
  checkboxSection: {
    backgroundColor: Colors.blue[100],
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.black,
    flex: 1,
    ...InterRegular,
  },
  ctaButton: {
    backgroundColor: Colors.purple[200],
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: Colors.purple[200],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaButtonText: {
    color: Colors.white,
    fontSize: 16,
    ...InterSemiBold,
  },
  errorMessage: {
    color: Colors.orange[300],
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
    ...InterSmall,
  },
};

export const desktopWelcomeStyles = {
  container: {
    marginHorizontal: 'auto',
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 60,
  },
  welcomeSection: {
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 96,
    marginBottom: 2,
    ...InterSemiBold,
  },
  logoImage: {
    width: 1088,
    height: 145,
    resizeMode: 'contain',
  },
  infoBlock: {
    backgroundColor: Colors.blue[100],
    padding: 32,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.purple[100],
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    ...InterRegular,
  },
  radioBlock: {
    padding: 32,
    marginBottom: 24,
  },
  radioText: {
    fontSize: 16,
    lineHeight: 24,
    ...InterRegular,
  },
  checkboxSection: {
    padding: 32,
    marginBottom: 32,
  },
  checkboxText: {
    fontSize: 16,
    lineHeight: 24,
    ...InterRegular,
  },
  ctaButton: {
    paddingVertical: 20,
    paddingHorizontal: 32,
  },
  ctaButtonText: {
    fontSize: 18,
    ...InterSemiBold,
  },
};

export const selectCollectiveTypeStyles = {
  container: {
    flex: 1,
    backgroundColor: Colors.gray[400],
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  content: {
    alignSelf: 'center',
    width: '100%',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 16,
    ...InterSemiBold,
  },
  titleBlue: {
    color: Colors.blue[200],
  },
  titlePurple: {
    color: Colors.purple[200],
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[500],
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '80%',
    ...InterRegular,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.blue[200],
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.purple[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    borderRadius: 30,
  },
  cardTitle: {
    fontSize: 16,
    color: Colors.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    ...InterSemiBold,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.gray[500],
    lineHeight: 20,
    ...InterRegular,
  },
  interestedButton: {
    backgroundColor: Colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  interestedButtonText: {
    color: Colors.white,
    fontSize: 12,
    ...InterSemiBold,
  },
  checkboxContainer: {
    width: 40,
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
  },
  navigationContainer: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.gray[600],
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 100,
  },
  backButtonText: {
    color: Colors.gray[500],
    fontSize: 16,
    ...InterSemiBold,
  },
  nextButton: {
    backgroundColor: Colors.purple[200],
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 100,
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: 16,
    ...InterSemiBold,
  },
  titleDesktop: {
    fontSize: 72,
    textAlign: 'center',
    marginBottom: 16,
    ...InterSemiBold,
  },
};
