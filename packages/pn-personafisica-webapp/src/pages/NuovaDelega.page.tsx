import currentLocale from 'date-fns/locale/it';
import { useNavigate } from 'react-router-dom';
import { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Button,
  Divider,
  Grid,
  MenuItem,
  Stack,
  Paper,
  Autocomplete,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import { IllusCompleted } from '@pagopa/mui-italia';
import { makeStyles } from '@mui/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  CourtesyPage,
  CustomDatePicker,
  DatePickerTypes,
  DATE_FORMAT,
  TitleBox,
  useIsMobile,
  PnBreadcrumb,
  isToday,
  dataRegex,
  searchStringLimitReachedText,
  useSearchStringChangeInput,
} from '@pagopa-pn/pn-commons';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { createDelegation, getAllEntities } from '../redux/newDelegation/actions';
import { resetNewDelegation } from '../redux/newDelegation/reducers';
import { NewDelegationFormProps } from '../redux/delegation/types';
import { RootState } from '../redux/store';
import * as routes from '../navigation/routes.const';
import VerificationCodeComponent from '../component/Deleghe/VerificationCodeComponent';
import LoadingPageWrapper from '../component/LoadingPageWrapper/LoadingPageWrapper';
import { generateVCode } from '../utils/delegation.utility';
import DropDownPartyMenuItem from '../component/Party/DropDownParty';
import { Party } from '../models/party';
import { TrackEventType } from '../utils/events';
import { trackEventByType } from '../utils/mixpanel';

const useStyles = makeStyles(() => ({
  root: {
    '& .paperContainer': {
      boxShadow: 'none',
    },
  },
  direction: {
    ['@media only screen and (max-width: 576px)']: {
      direction: 'column',
    },
    ['@media only screen and (min-width: 577px) and (max-width: 992px)']: {
      direction: 'row',
    },
  },
  margin: {
    ['@media only screen and (max-width: 576px)']: {
      margin: 0,
    },
    ['@media only screen and (min-width: 577px) and (max-width: 992px)']: {
      direction: 'auto',
    },
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
}));


const NuovaDelega = () => {
  const classes = useStyles();
  const { t } = useTranslation(['deleghe', 'common']);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const dispatch = useAppDispatch();
  const { entities, created } = useAppSelector((state: RootState) => state.newDelegationState);
  const handleSearchStringChangeInput = useSearchStringChangeInput();
  const handleSubmit = (values: NewDelegationFormProps) => {
    void dispatch(createDelegation(values));
    trackEventByType(TrackEventType.DELEGATION_DELEGATE_ADD_ACTION);
  };
  const [senderInputValue, setSenderInputValue] = useState('');
  const handleDelegationsClick = () => {
    navigate(routes.DELEGHE);
  };

  // Get tomorrow date
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const initialValues = {
    selectPersonaFisicaOrPersonaGiuridica: 'pf',
    codiceFiscale: '',
    nome: '',
    cognome: '',
    selectTuttiEntiOrSelezionati: 'tuttiGliEnti',
    expirationDate: tomorrow,
    enti: [],
    verificationCode: generateVCode(),
  };

  const validationSchema = yup.object({
    selectPersonaFisicaOrPersonaGiuridica: yup
      .string()
      .required(t('nuovaDelega.validation.email.required')),
    codiceFiscale: yup
      .string()
      .required(t('nuovaDelega.validation.fiscalCode.required'))
      .matches(dataRegex.fiscalCode, t('nuovaDelega.validation.fiscalCode.wrong')),
    nome: yup.string().required(t('nuovaDelega.validation.name.required')),
    cognome: yup.string().required(t('nuovaDelega.validation.surname.required')),
    enti: yup.array().required(),
    expirationDate: yup
      .mixed()
      .required(t('nuovaDelega.validation.expirationDate.required'))
      .test(
        'validDate',
        t('nuovaDelega.validation.expirationDate.wrong'),
        (value) => value?.getTime() >= tomorrow.getTime()
      ),
  });

  const xsValue = isMobile ? 12 : 4;

  useEffect(() => {
    dispatch(resetNewDelegation());
  }, []);

  useEffect(() => {
    if (senderInputValue.length >= 4) {
      void dispatch(getAllEntities({ paNameFilter: senderInputValue, blockLoading: true }));
    } else if (senderInputValue.length === 0 && loadAllEntities) {
      void dispatch(getAllEntities({ blockLoading: true }));
    }
  }, [senderInputValue]);

  const [loadAllEntities, setLoadAllEntities] = useState(false);

  useEffect(() => {
    if (loadAllEntities) {
      void dispatch(getAllEntities({}));
    }
  }, [loadAllEntities]);

  const handleGetAllEntities = () => {
    if (!loadAllEntities) {
      setLoadAllEntities(true);
    }
  };

  const renderOption = (props: any, option: Party) => (
    <MenuItem {...props} value={option.id} key={option.id}>
      <DropDownPartyMenuItem name={option.name} />
    </MenuItem>
  );

  // handling of search string for sender
  const entitySearchLabel = (searchString: string): string => 
    `${t('nuovaDelega.form.selectEntities')}${searchStringLimitReachedText(searchString)}`
  ;
  const handleChangeInput = (newInputValue: string) => handleSearchStringChangeInput(newInputValue, setSenderInputValue);

  const getOptionLabel = (option: Party) => option.name || '';

  const breadcrumbs = (
    <Fragment>
      <PnBreadcrumb
        linkRoute={routes.DELEGHE}
        linkLabel={
          <Fragment>
            <PeopleIcon sx={{ mr: 0.5 }} />
            {t('nuovaDelega.title')}
          </Fragment>
        }
        currentLocationLabel={t('nuovaDelega.breadcrumb')}
      />
      <TitleBox
        title={t('nuovaDelega.title')}
        subTitle={t('nuovaDelega.subtitle')}
        variantTitle="h3"
        variantSubTitle="body1"
        sx={{ pt: '20px' }}
      />
      <Typography sx={{ mt: '1rem', mb: '1rem' }}>
        {t('nuovaDelega.form.mandatoryField')}
      </Typography>
    </Fragment>
  );

  return (
    <LoadingPageWrapper isInitialized>
      {!created && (
        <Box className={classes.root} sx={{ p: { xs: 3, lg: 0 } }}>
          {isMobile && breadcrumbs}
          <Grid container direction={isMobile ? 'column-reverse' : 'row'}>
            <Grid item lg={8} xs={12} sx={{ p: { xs: 0, lg: 3 } }}>
              {!isMobile && breadcrumbs}
              <Paper sx={{ padding: '24px', marginBottom: '20px' }} className="paperContainer">
                <Typography sx={{ fontWeight: 'bold' }}>
                  {t('nuovaDelega.form.personType')}
                </Typography>
                <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={(values: NewDelegationFormProps) => {
                    handleSubmit(values);
                  }}
                  validateOnBlur={false}
                >
                  {
                  
                  ({ values, setFieldValue, touched, errors, setFieldTouched }) => (
                    <Form>
                      <FormControl sx={{ width: '100%' }}>
                        <RadioGroup
                          aria-labelledby="radio-buttons-group-pf-pg"
                          defaultValue="pf"
                          name="selectPersonaFisicaOrPersonaGiuridica"
                          value={values.selectPersonaFisicaOrPersonaGiuridica.toString()}
                          onChange={(event) => {
                            setFieldValue(
                              'selectPersonaFisicaOrPersonaGiuridica',
                              event.currentTarget.value
                            );
                          }}
                        >
                          <Grid
                            container
                            sx={{ width: '100%', justifyContent: 'space-between' }}
                            className={classes.direction}
                          >
                            <Grid item xs={isMobile ? 12 : 3}>
                              <FormControlLabel
                                value="pf"
                                control={<Radio />}
                                name={'selectPersonaFisicaOrPersonaGiuridica'}
                                label={t('nuovaDelega.form.naturalPerson')}
                              />
                            </Grid>
                            <Grid item xs={xsValue} className={classes.margin}>
                              <TextField
                                sx={{ margin: 'auto' }}
                                id="nome"
                                value={values.nome.toString()}
                                onChange={(event) => {
                                  setFieldValue('nome', event.currentTarget.value);
                                }}
                                label={t('nuovaDelega.form.firstName')}
                                name="nome"
                                error={touched.nome && Boolean(errors.nome)}
                                helperText={touched.nome && errors.nome}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={xsValue} className={classes.margin}>
                              <TextField
                                sx={{ margin: 'auto', mt: isMobile ? 1 : 0 }}
                                id="cognome"
                                value={values.cognome.toString()}
                                onChange={(event) => {
                                  setFieldValue('cognome', event.currentTarget.value);
                                }}
                                label={t('nuovaDelega.form.lastName')}
                                name="cognome"
                                error={touched.cognome && Boolean(errors.cognome)}
                                helperText={touched.cognome && errors.cognome}
                                fullWidth
                              />
                            </Grid>
                          </Grid>
                          <FormControlLabel
                            value="pg"
                            control={<Radio />}
                            name={'selectPersonaFisicaOrPersonaGiuridica'}
                            label={t('nuovaDelega.form.legalPerson')}
                            disabled
                          />
                        </RadioGroup>
                      </FormControl>
                      <TextField
                        sx={{ marginTop: '2rem' }}
                        id="codiceFiscale"
                        value={values.codiceFiscale.toString()}
                        onChange={(event) => {
                          setFieldValue('codiceFiscale', event.currentTarget.value);
                        }}
                        label={t('nuovaDelega.form.fiscalCode')}
                        name="codiceFiscale"
                        error={touched.codiceFiscale && Boolean(errors.codiceFiscale)}
                        helperText={touched.codiceFiscale && errors.codiceFiscale}
                        fullWidth
                      />
                      <Typography fontWeight={'bold'} sx={{ marginTop: '2rem' }}>
                        {t('nuovaDelega.form.viewFrom')}
                      </Typography>
                      <FormControl sx={{ width: '100%' }}>
                        <RadioGroup
                          aria-labelledby="radio-buttons-group-pf-pg"
                          defaultValue="tuttiGliEnti"
                          name="selectTuttiEntiOrSelezionati"
                          value={values.selectTuttiEntiOrSelezionati.toString()}
                          onChange={(event) => {
                            setFieldValue(
                              'selectTuttiEntiOrSelezionati',
                              event.currentTarget.value
                            );
                            if (event.currentTarget.value === 'entiSelezionati') {
                              handleGetAllEntities();
                            }
                          }}
                        >
                          <FormControlLabel
                            value="tuttiGliEnti"
                            control={<Radio />}
                            name={'selectTuttiEntiOrSelezionati'}
                            label={t('nuovaDelega.form.allEntities')}
                          />
                          <Grid container className={classes.direction}>
                            <Grid item xs={isMobile ? 12 : 6}>
                              <FormControlLabel
                                value="entiSelezionati"
                                control={<Radio />}
                                data-testid="radioSelectedEntities"
                                name={'selectTuttiEntiOrSelezionati'}
                                label={t('nuovaDelega.form.onlySelected')}
                              />
                            </Grid>
                            <Grid item xs={isMobile ? 12 : 6} className={classes.margin}>
                              {values.selectTuttiEntiOrSelezionati === 'entiSelezionati' && (
                                <FormControl fullWidth>
                                  <Autocomplete
                                    id="ente-select"
                                    multiple
                                    options={entities}
                                    fullWidth
                                    autoComplete
                                    getOptionLabel={getOptionLabel}
                                    noOptionsText={t('common.enti-not-found', { ns: 'recapiti' })}
                                    isOptionEqualToValue={(option, value) =>
                                      option.name === value.name
                                    }
                                    onChange={(_event: any, newValue: Array<Party>) => {
                                      setFieldValue('enti', newValue);
                                    }}
                                    inputValue={senderInputValue}
                                    onInputChange={(_event, newInputValue) =>
                                      handleChangeInput(newInputValue)
                                    }
                                    filterOptions={(e) => e}
                                    renderOption={renderOption}
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        label={entitySearchLabel(senderInputValue)}
                                      />
                                    )}
                                  />
                                </FormControl>
                              )}
                            </Grid>
                          </Grid>
                        </RadioGroup>
                      </FormControl>
                      <br />
                      <Box sx={{ marginTop: '1rem', width: '100%' }}>
                        <FormControl fullWidth>
                          <LocalizationProvider
                            dateAdapter={AdapterDateFns}
                            adapterLocale={currentLocale}
                          >
                            <CustomDatePicker
                              label={t('nuovaDelega.form.endDate')}
                              inputFormat={DATE_FORMAT}
                              value={new Date(values.expirationDate)}
                              minDate={tomorrow}
                              onChange={(value: DatePickerTypes) => {
                                setFieldTouched('expirationDate', true, false);
                                setFieldValue('expirationDate', value);
                              }}
                              shouldDisableDate={isToday}
                              renderInput={(params) => (
                                <TextField
                                  id="expirationDate"
                                  name="expirationDate"
                                  {...params}
                                  aria-label="Data termine delega" // aria-label for (TextField + Button) Group
                                  inputProps={{
                                    ...params.inputProps,
                                    inputMode: 'text',
                                    'aria-label': 'Inserisci la data di termine della delega',
                                    type: 'text',
                                  }}
                                  error={touched.expirationDate && Boolean(errors.expirationDate)}
                                  helperText={touched.expirationDate && errors.expirationDate}
                                />
                              )}
                              disablePast={true}
                            />
                          </LocalizationProvider>
                        </FormControl>
                      </Box>
                      <Divider sx={{ marginTop: '1rem' }} />
                      <Typography fontWeight={'bold'} sx={{ marginTop: '1rem' }}>
                        {t('nuovaDelega.form.verificationCode')}
                      </Typography>
                      <Stack
                        direction={{ xs: 'column', lg: 'row' }}
                        justifyContent={{ sm: 'flex-start' }}
                        spacing={2}
                      >
                        <Typography sx={{ marginTop: '1rem', flexGrow: '1' }}>
                          {t('nuovaDelega.form.verificationCodeDescr')}
                        </Typography>
                        <VerificationCodeComponent code={values.verificationCode} />
                      </Stack>
                      <Divider sx={{ marginTop: '1rem' }} />
                      <Grid container sx={{ marginTop: '1rem' }}>
                        <Grid item xs={12} sx={{ margin: 'auto' }}>
                          <Button
                            sx={{ marginTop: '1rem', margin: 'auto' }}
                            type={'submit'}
                            variant={'contained'}
                            data-testid="createButton"
                          >
                            {t('nuovaDelega.form.submit')}
                          </Button>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </Formik>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
      {created && (
        <CourtesyPage
          icon={<IllusCompleted />}
          title={t('nuovaDelega.createdTitle')}
          subtitle={t('nuovaDelega.createdDescription')}
          onClick={handleDelegationsClick}
          onClickLabel={t('nuovaDelega.backToDelegations')}
        />
      )}
    </LoadingPageWrapper>
  );
};

export default NuovaDelega;
