import React, { FC } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { DatabaseConnectionUsingCSVFormValues } from './form-schema'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import DATABASE_PROVIDERS from '@/constants/database-providers'
import Image from 'next/image'
import { Input } from '../ui/input'

const DatabaseConnectionFormUsingCSV: FC<{
  form: UseFormReturn<DatabaseConnectionUsingCSVFormValues>
}> = ({ form }) => {
  const { setValue, watch } = form
  const dataWarehouse = watch('data_warehouse')
  const selectedDatabaseProvider = DATABASE_PROVIDERS.find(
    (dp) => dp.driver === dataWarehouse,
  )

  return (
    <Form {...form}>
      <form>
        <fieldset
          disabled={form.formState.isSubmitting}
          className="flex flex-col gap-3"
        >
          <FormField
            control={form.control}
            name="data_warehouse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data warehouse</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          selectedDatabaseProvider ? (
                            <div className="flex items-center gap-2">
                              <Image
                                priority
                                src={selectedDatabaseProvider.logoUrl}
                                alt={selectedDatabaseProvider.name}
                                width={18}
                                height={18}
                              />
                              {selectedDatabaseProvider.name}
                            </div>
                          ) : (
                            <span className="text-[#64748B]">
                              Select your database provider
                            </span>
                          )
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DATABASE_PROVIDERS?.map((option, idx) => (
                      <SelectItem key={idx} value={option.driver}>
                        <div className="flex items-center gap-2">
                          <Image
                            priority
                            src={option.logoUrl}
                            alt={option.name}
                            width={18}
                            height={18}
                          />
                          {option.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormMessage>
            {form.getFieldState('data_warehouse').error?.message}
          </FormMessage>
          <FormField
            control={form.control}
            name="alias"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alias</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Type an alias for the database"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Account Key File</FormLabel>
                <FormControl>
                  <Input
                    className="cursor-pointer"
                    placeholder="Upload key file"
                    type="file"
                    ref={field.ref}
                    onChange={(e) => {
                      const files = e.target.files
                      if (files) {
                        setValue('file', files[0], {
                          shouldValidate: true,
                        })
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>
      </form>
    </Form>
  )
}

export default DatabaseConnectionFormUsingCSV
