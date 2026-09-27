import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    // Sans adapter, Auth.js attribue un UUID aléatoire à chaque connexion : on fixe
    // `sub` sur le compte du fournisseur pour que l'historique des téléchargements
    // (table `downloads`, clé `user_id`) survive à une déconnexion.
    jwt({ token, account }) {
      if (account) token.sub = `${account.provider}:${account.providerAccountId}`;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
