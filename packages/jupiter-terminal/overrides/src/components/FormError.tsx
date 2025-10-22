import React from 'react'

const FormError: React.FC<{
  errors: Record<string, { title: string; message: string }>
}> = ({ errors }) => {
  return (
    <>
      {Object.keys(errors).map((key) => (
        <div key={key} className="w-full mt-5 py-3 px-5 space-y-1 rounded-lg pcs-form-error">
          <div className="flex items-start space-x-2.5">
            <div className="flex-grow">
              <p className="text-[12px] leading-[1.67]">{errors[key].title}</p>
              {errors[key].message ? (
                <p className="text-[12px] leading-[1.17] pcs-form-error-msg">{errors[key].message}</p>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default FormError
