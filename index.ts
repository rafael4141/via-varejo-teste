import express, { Express, Request, Response } from 'express'
import axios from 'axios'

const app: Express = express()
const port = 3000

interface RequestBody {
  produto: {
    codigo: number,
    nome: string,
    valor: number
  }
  condicaoPagamento: {
    valorEntrada: number,
    qtdeParcelas: number
  }
}

interface ResponseBody {
  numeroParcela: number,
  valor: string,
  taxaJurosAoMes: number,
}

// -> retorna lista de parcelas acrecidas de taxa selic, somente se for acima de 6 parcelas

app.use(express.json())

app.post('/', async (req: Request, res: Response) => {
  const taxaJurosAoMes = await (await axios.get('http://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados/ultimos/1?formato=json')).data[0].valor

  const { produto, condicaoPagamento } = req.body as RequestBody
  let valorParcela = produto.valor / condicaoPagamento.qtdeParcelas

  let parcelas: Array<ResponseBody> = []

  if (condicaoPagamento.qtdeParcelas > 6) {
    valorParcela *= taxaJurosAoMes
  }

  for (let i: number = 0; i < condicaoPagamento.qtdeParcelas; i++) {
    const data = {
      numeroParcela: i + 1,
      valor: valorParcela.toFixed(2),
      taxaJurosAoMes
    }

    parcelas.push(data)
  }

  res.json(parcelas)
})

app.listen(port, () => console.log(`Example app listening on http://localhost:${port}`))
