import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router"

type Variables = {
  roleId: string
  userIds: string[]
}

const useEditUsersInRole = () => {
  const navigate = useNavigate()

  // to be replaced with real api call
  return useMutation({
    mutationFn: (variables: Variables) => {
      console.log(variables)
      return Promise.resolve(variables)
    },
    onSuccess: () => navigate(-1)
  })
}

export default useEditUsersInRole