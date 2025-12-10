'use client'
import type {
  FormFieldBlock as BaseFormFieldBlock,
  Form as FormType,
} from '@payloadcms/plugin-form-builder/types'

type FormFieldBlock = BaseFormFieldBlock & {
  width?: number
}

import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { fields } from './fields'
import { getClientSideURL } from '@/utilities/getURL'
import { cn } from '@/utilities/ui'
import Image from 'next/image'
import { Link } from '@/i18n/routing'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType & {
    fields: FormFieldBlock[]
  }
  introContent?: SerializedEditorState
  onlyForm?: boolean
}

export const FormBlock: React.FC<
  {
    id?: string
  } & FormBlockType
> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    introContent,
    onlyForm,
  } = props

  const formMethods = useForm({
    defaultValues: formFromProps.fields,
  })
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()
  const router = useRouter()

  const onSubmit = useCallback(
    (data: FormFieldBlock[]) => {
      let loadingTimerID: ReturnType<typeof setTimeout>
      const submitForm = async () => {
        setError(undefined)

        const dataToSend = Object.entries(data).map(([name, value]) => ({
          field: name,
          value,
        }))

        // delay loading indicator by 1s
        loadingTimerID = setTimeout(() => {
          setIsLoading(true)
        }, 1000)

        try {
          const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            body: JSON.stringify({
              form: formID,
              submissionData: dataToSend,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })

          const res = await req.json()

          clearTimeout(loadingTimerID)

          if (req.status >= 400) {
            setIsLoading(false)

            setError({
              message: res.errors?.[0]?.message || 'Internal Server Error',
              status: res.status,
            })

            return
          }

          setIsLoading(false)
          setHasSubmitted(true)

          // Track Lead event with Meta Pixel
          try {
            if (typeof window !== 'undefined' && window.fbq) {
              window.fbq('track', 'Lead')
              console.log('[Meta Pixel] Lead event tracked successfully')
            } else {
              console.warn('[Meta Pixel] fbq not available')
            }
          } catch (pixelError) {
            console.error('[Meta Pixel] Error tracking Lead event:', pixelError)
          }

          if (confirmationType === 'redirect' && redirect) {
            const { url } = redirect

            const redirectUrl = url

            if (redirectUrl) router.push(redirectUrl)
          }
        } catch (err) {
          console.warn(err)
          setIsLoading(false)
          setError({
            message: 'Something went wrong.',
          })
        }
      }

      void submitForm()
    },
    [router, formID, redirect, confirmationType],
  )

  return (
    <div
      className={cn('container', {
        'bg-image': onlyForm,
      })}
    >
      {enableIntro && introContent && !hasSubmitted && (
        <RichText
          className="mb-8 lg:mb-12 text-center font-bodoni"
          data={introContent}
          enableGutter={false}
        />
      )}
      <div className="p-4 lg:p-6 flex flex-col md:flex-row gap-8 justify-center items-start">
        {!onlyForm && (
          <div className="mb-8 lg:mb-12 bg-gray-200 w-full md:w-fit p-6 !h-[fit-content] gap-6 flex flex-col">
            <h2 className="text-2xl font-bold font-bodoni">ARAN Maroc</h2>
            <p className="text-gray-600">
              RABAT-Agdal, 457, <br /> Avenue Hassan II,
              <br /> Résidence Mariam, Magasin n° 11
            </p>
            <div className="flex flex-row gap-3 justify-start items-center">
              {Socials?.map(({ link, url }, i) => {
                return (
                  <Link href={link?.url || ''} key={i}>
                    <Image src={url || ''} width={24} height={24} alt="" className="" />
                  </Link>
                )
              })}
            </div>
          </div>
        )}
        <FormProvider {...formMethods}>
          {!isLoading && hasSubmitted && confirmationType === 'message' && (
            <div
              role="status"
              aria-live="polite"
              className="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 text-green-600"
              >
                <path
                  fillRule="evenodd"
                  d="M10.72 15.72a.75.75 0 0 1-1.06 0l-3.22-3.22a.75.75 0 1 1 1.06-1.06l2.69 2.69 6.28-6.28a.75.75 0 1 1 1.06 1.06l-7 7Z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <RichText data={confirmationMessage} />
              </div>
            </div>
          )}
          {error && <div>{`${error.status || '500'}: ${error.message || ''}`}</div>}
          {!hasSubmitted && (
            <form
              id={formID}
              onSubmit={handleSubmit(onSubmit)}
              className={cn('!max-w-[35rem]', onlyForm && '!w-full')}
            >
              <div className="mb-4 last:mb-0 grid grid-cols-2 gap-4">
                {formFromProps &&
                  formFromProps.fields &&
                  formFromProps.fields?.map((field, index) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields]
                    if (Field) {
                      return (
                        <div
                          className={cn('mb-1 last:mb-0', {
                            'col-span-2 lg:col-span-1':
                              (formFromProps.fields?.[index]?.width ?? 100) < 50,
                            'col-span-2': (formFromProps.fields?.[index]?.width ?? 100) >= 50,
                          })}
                          key={index}
                        >
                          <Field
                            form={formFromProps}
                            {...field}
                            {...formMethods}
                            control={control}
                            errors={errors}
                            register={register}
                          />
                        </div>
                      )
                    }
                    return null
                  })}
              </div>

              <Button
                form={formID}
                type="submit"
                variant="default"
                disabled={isSubmitting || isLoading}
                aria-busy={isSubmitting || isLoading}
                aria-live="polite"
              >
                {isSubmitting || isLoading ? 'Sending…' : submitButtonLabel}
              </Button>
            </form>
          )}
        </FormProvider>
      </div>
    </div>
  )
}

const Socials = [
  {
    link: {
      type: 'custom',
      url: 'https://www.instagram.com/arancucinema/p/DJ2RGm3tc6j/',
      label: 'instagram',
    },
    url: '/api/media/file/download%20(4).svg',
    thumbnailURL: null,
  },

  {
    link: {
      type: 'custom',
      url: 'https://www.facebook.com/people/ARANcucine-Maroc/61575494607302/',
      label: 'instagram',
    },
    url: '/api/media/file/download%20(5).svg',
    thumbnailURL: null,
  },
]
