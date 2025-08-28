import {
    IonButton,
    IonCard,
    IonCardContent,
    IonInput,
    IonInputPasswordToggle,
    IonItem,
    IonList,
    IonLoading,
    IonPage,
    IonSpinner,
    useIonRouter,
} from '@ionic/react';
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { cn } from '../utils/cn';
import { Link, Redirect } from 'react-router-dom';
import './Login.css';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../services/openapi';
import { useToast } from '../hooks/useToast';

const validationSchema = Yup.object({
    email: Yup.string()
        .required('Email is required')
        .email('Invalid email')
        .trim(),
    password: Yup.string().required('Password is required'),
});

type LoginFormData = Yup.InferType<typeof validationSchema>;

export default function Login() {
    const { user, loading, login } = useAuth();
    const router = useIonRouter();
    const { toast } = useToast();
    const {
        register,
        handleSubmit,
        formState: { errors, touchedFields, isSubmitting },
    } = useForm<LoginFormData>({
        mode: 'onTouched',
        reValidateMode: 'onChange',
        resolver: yupResolver(validationSchema),
    });

    useEffect(() => {
        if (user && router) {
            router.push('/', 'root', 'replace');
        }
    }, [user, router]);

    const onSubmit = useCallback(
        async (data: LoginFormData) => {
            try {
                await login(data.email, data.password);
            } catch (error) {
                if (error instanceof ApiError && error.status === 422) {
                    await toast(
                        'The provided credentials are incorrect.',
                        'danger',
                    );
                } else {
                    await toast('An unexpected error occurred.', 'warning');
                }
            }
        },
        [login, toast],
    );

    useEffect(() => {
        if (user) {
            router.push('/app/canvases', 'forward', 'replace');
        }
    }, [user, router]);

    if (user) {
        return <Redirect to="/app" />;
    }

    return (
        <IonPage>
            <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <IonCard>
                    <IonCardContent>
                        <div>
                            <IonList className="space-y-6 ion-padding">
                                <IonItem>
                                    <IonInput
                                        {...register('email', {
                                            required: true,
                                        })}
                                        type="email"
                                        label="Email address"
                                        labelPlacement="stacked"
                                        placeholder="test@exmaple.com"
                                        autocomplete="email"
                                        errorText={errors.email?.message}
                                        autoFocus
                                        className={cn({
                                            'ion-invalid': !!errors.email,
                                            'ion-valid': !errors.email,
                                            'ion-touched': touchedFields.email,
                                        })}
                                    />
                                </IonItem>
                                <IonItem>
                                    <IonInput
                                        {...register('password', {
                                            required: true,
                                        })}
                                        type="password"
                                        label="Password"
                                        labelPlacement="stacked"
                                        placeholder="********"
                                        autocomplete="current-password"
                                        errorText={errors.password?.message}
                                        className={cn({
                                            'ion-invalid': !!errors.password,
                                            'ion-valid': !errors.password,
                                            'ion-touched':
                                                touchedFields.password,
                                        })}>
                                        <IonInputPasswordToggle slot="end" />
                                    </IonInput>
                                </IonItem>
                                <IonItem lines="none" className="text-sm">
                                    <Link to="#" className="link font-semibold">
                                        Forgot password?
                                    </Link>
                                </IonItem>
                                <IonButton
                                    onClick={handleSubmit(onSubmit)}
                                    type="submit"
                                    color="primary"
                                    className="w-full text-sm/6"
                                    disabled={isSubmitting || loading}>
                                    {isSubmitting || loading ? (
                                        <IonSpinner name="crescent" />
                                    ) : (
                                        'Sign in'
                                    )}
                                </IonButton>
                            </IonList>
                            <p className="mt-10 text-center text-sm/6 text-gray-500">
                                Not a member?{' '}
                                <Link
                                    to="/register"
                                    className="link font-semibold">
                                    Register Now!
                                </Link>
                            </p>
                        </div>
                    </IonCardContent>
                </IonCard>
            </div>
        </IonPage>
    );
}
