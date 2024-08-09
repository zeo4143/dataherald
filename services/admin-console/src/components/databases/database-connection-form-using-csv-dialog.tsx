import { Databases, DBConnectionCSV, ErrorResponse } from '@/models/api'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog'
import { CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { FC, ReactNode, useState } from 'react'
import { Alert, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'
import { DialogHeader, DialogFooter } from '../ui/dialog'
import { Toaster } from '../ui/toaster'
import {
  DatabaseConnectionUsingCSVFormValues,
  dbConnectionUsingCSVFormSchema,
} from './form-schema'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from '../ui/use-toast'
import { ToastAction } from '../ui/toast'
import DatabaseConnectionFormUsingCSV from './database-connection-form-using-csv'
import usePostDatabaseConnectionCSV from '@/hooks/api/database-connection/usePostDatabaseConnectionUsingCSV'

const mapDatabaseConnectionFormValues = (
  formValues: DatabaseConnectionUsingCSVFormValues,
): DBConnectionCSV => ({
  data_warehouse: formValues.data_warehouse,
  alias: formValues.alias,
})

interface DatabaseConnectionFormUsingCSVDialogProps {
  isFirstConnection?: boolean
  renderTrigger: () => ReactNode
  onConnected: (newDatabases?: Databases, refresh?: boolean) => void
  onFinish?: () => void
}

const DatabaseConnectionFormUsingCSVDialog: FC<
  DatabaseConnectionFormUsingCSVDialogProps
> = ({ isFirstConnection = false, renderTrigger, onConnected, onFinish }) => {
  const form = useForm<DatabaseConnectionUsingCSVFormValues>({
    resolver: yupResolver(dbConnectionUsingCSVFormSchema),
    defaultValues: {
      alias: '',
    },
  })

  const [databaseConnected, setDatabaseConnected] = useState(false)

  const [dbError, setDbError] = useState<ErrorResponse | null>(null)

  const connectDatabase = usePostDatabaseConnectionCSV()

  const onSubmit = async () => {
    try {
      setDbError(null)
      const formFieldsValues = form.getValues()
      await connectDatabase(
        mapDatabaseConnectionFormValues(formFieldsValues),
        formFieldsValues.file as File | null | undefined,
      )
      setDatabaseConnected(true)
      onConnected(undefined, false)
    } catch (e) {
      console.error(e)
      const { message: title, trace_id: description } = e as ErrorResponse
      setDbError(e as ErrorResponse)
      toast({
        variant: 'destructive',
        title,
        description,
        action: (
          <ToastAction
            altText="Try again"
            onClick={() => form.handleSubmit(onSubmit)()}
          >
            Try again
          </ToastAction>
        ),
      })
    }
  }
  const handleDialogOpenChange = (open: boolean) => {
    if (databaseConnected && !open) {
      form.reset()
      setDatabaseConnected(false)
      onFinish && onFinish()
    }
  }

  return (
    <>
      <Dialog onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>{renderTrigger()}</DialogTrigger>
        <DialogContent
          className="max-w-[70vw] lg:max-w-[750px] h-[90vh] flex flex-col"
          onInteractOutside={(e) => e.preventDefault()}
        >
          {databaseConnected ? (
            <>
              <DialogHeader className="flex-none px-1">
                <DialogTitle>
                  <div className="flex flex-row items-center gap-2">
                    <CheckCircle />
                    {isFirstConnection
                      ? 'Database connected'
                      : 'Database added'}
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="grow flex flex-col gap-5 px-1">
                <p>
                  Connection successful! To begin using this database for
                  queries, select the tables you wish to scan and synchronize
                  with the platform.
                </p>
                <Alert variant="info" className="flex items-start gap-2">
                  <div>
                    <AlertCircle />
                  </div>
                  <AlertDescription>
                    This process can take a few minutes for small tables up to
                    several hours for large datasets.
                  </AlertDescription>
                </Alert>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button>Done</Button>
                </DialogClose>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader className="flex-none px-1">
                <DialogTitle>
                  {isFirstConnection ? 'Connect your Database' : 'Add Database'}
                </DialogTitle>
                <DialogDescription>
                  {isFirstConnection
                    ? 'Connect your database to start using the platform. '
                    : 'Connect another database to the platform. '}
                </DialogDescription>
              </DialogHeader>
              <div className="grow flex flex-col overflow-auto p-1">
                <div className="grow flex flex-col gap-3">
                  <DatabaseConnectionFormUsingCSV form={form} />
                  {dbError && (
                    <Alert variant="destructive" className="my-5">
                      <AlertDescription className="break-words">
                        {dbError.description || dbError.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <DialogFooter className="mt-3">
                  <Button
                    onClick={form.handleSubmit(onSubmit)}
                    type="button"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader
                          className="mr-2 animate-spin"
                          size={16}
                          strokeWidth={2.5}
                        />{' '}
                        {isFirstConnection ? 'Connecting' : 'Adding'} Database
                      </>
                    ) : (
                      <>
                        {isFirstConnection
                          ? 'Connect Database'
                          : 'Add Database'}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  )
}

export default DatabaseConnectionFormUsingCSVDialog
