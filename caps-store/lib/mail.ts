
export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  // Para modo desarrollo, logueamos el link en la consola.
  // En producción, aquí integrarías un servicio como Resend o Amazon SES.
  console.log("-----------------------------------------");
  console.log("RESTABLECIMIENTO DE CONTRASEÑA");
  console.log(`Para: ${email}`);
  console.log(`Link: ${resetLink}`);
  console.log("-----------------------------------------");
};
