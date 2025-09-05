import { StyleSheet } from 'react-native';
import { Colors } from '../../utils/colors';

export const welcomeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    fontWeight: '600',
    marginBottom: 4,
  },
  logoImage: {
    width: 365,
    height: 50,
    resizeMode: 'contain',
  },
  infoBlock: {
    background: 'linear-gradient(135deg, #D6E1FF 0%, #1B7AEB 40%)',
    backgroundColor: '#D6E1FF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2EAFF',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1F2937',
    textAlign: 'justify',
  },
  radioBlock: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6E6E6',
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
    color: '#1F2937',
    flex: 1,
  },
  checkboxSection: {
    backgroundColor: '#CBDAFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
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
    color: '#1F2937',
    flex: 1,
  },
  ctaButton: {
    backgroundColor: '#5B7AC6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#5B7AC6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorMessage: {
    color: '#991B1B',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
  },
});

export const desktopWelcomeStyles = StyleSheet.create({
  container: {
    maxWidth: 600,
    marginHorizontal: 'auto',
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 60,
  },
  welcomeSection: {
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 48,
    marginBottom: 2,
  },
  logoImage: {
    width: 365,
    height: 50,
    resizeMode: 'contain',
  },
  infoBlock: {
    background: 'linear-gradient(135deg, #D6E1FF 0%, #1B7AEB 40%)',
    backgroundColor: '#D6E1FF',
    padding: 32,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2EAFF',
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
  },
  radioBlock: {
    padding: 32,
    marginBottom: 24,
  },
  radioText: {
    fontSize: 16,
    lineHeight: 24,
  },
  checkboxSection: {
    padding: 32,
    marginBottom: 32,
  },
  checkboxText: {
    fontSize: 16,
    lineHeight: 24,
  },
  ctaButton: {
    paddingVertical: 20,
    paddingHorizontal: 32,
  },
  ctaButtonText: {
    fontSize: 18,
  },
});

export const selectCollectiveTypeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Light lavender background
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  content: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  titleBlue: {
    color: '#1B7BEC',
  },
  titlePurple: {
    color: '#8B5CF6',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '80%',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1B7BEC',
    padding: 20,
    shadowColor: '#000',
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
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    borderRadius: 30,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
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
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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
    backgroundColor: 'white',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 100,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#5C7CFA',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 100,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
