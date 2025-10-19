// TODO: Replace with actual API authentication
export async function loginUser(email: string, password: string) {
  // Mock authentication
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (email && password) {
    return {
      success: true,
      user: {
        id: "1",
        name: "Usuario Demo",
        email,
      },
    }
  }

  return {
    success: false,
    error: "Credenciales inválidas",
  }
}

export async function registerUser(name: string, email: string, password: string) {
  // Mock registration
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (name && email && password) {
    return {
      success: true,
      user: {
        id: Date.now().toString(),
        name,
        email,
      },
    }
  }

  return {
    success: false,
    error: "Error en el registro",
  }
}
