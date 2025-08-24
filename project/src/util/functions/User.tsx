import { QueryClient } from "@tanstack/react-query";

export const handleUpdateUser = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ["currentUser"] });
  queryClient.invalidateQueries({ queryKey: ["currentUserBilling"] });
  queryClient.invalidateQueries({ queryKey: ["currentUserSubscription"] });
};

// OPTION 2: REFETCH -> USEFUL if still in stale time, data has not been queried yet, or needs immediate update (invalidated query gets put on queue, delayed until other queries are done)
// export const handleUpdateUser = async (queryClient: QueryClient) => {
//   try {
//     const updatedUser = await queryClient.fetchQuery({
//       queryKey: ["currentUser"],
//       queryFn: async () => {
//         const res = await makeRequest.get("/api/users/current");
//         return res.data;
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching updated user:", error);
//   }
// };
