export default function TestSpecialChar(text: string) {
  const specialChars = /[ `!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/;
  return specialChars.test(text);
}
