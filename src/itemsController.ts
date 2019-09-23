import csv from 'csvtojson';
import { Request, Response } from 'express';
import { Item } from './item';
import { resolve } from 'path';

const csvFilePath = resolve(__dirname, '../store.csv');
interface Server {
  name: string,
  errorFrequency: number
}
interface ServerList {
  servers: Server[]
}
export class ItemsController {
  static errorFrequency: number = 0
  static server: ServerList = {
    "servers": [
      {
        "name": "alpha",
        "errorFrequency": 7
      },
    ]
  }
  static activeServers: any = {}
  static setErrorFreq(serverName: string, _res: Response) {
    let serverFound = false
    for (let server of ItemsController.server.servers) {
      if (server.name === serverName) {
        serverFound = true
        ItemsController.errorFrequency = server.errorFrequency
        if (server.errorFrequency >= 10) {
          return false
        }
        if (!ItemsController.activeServers[serverName]) {
          ItemsController.activeServers[serverName] = 9
        } else {
          if (ItemsController.activeServers[serverName] <= ItemsController.errorFrequency) {
            ItemsController.activeServers[serverName]
            if (ItemsController.activeServers[serverName] === 0) { ItemsController.activeServers[serverName] = 10 }
            return false
          } else {
            ItemsController.activeServers[serverName]--
          }
        }
      }
    } if (!serverFound) {
      return false
    }
    return true
  }
  static getSingleItem(req: Request, res: Response) {
    const id: string = (req.params as any).id;
    const serverName = (req.params as any).serverName.toLowerCase()
    if (!ItemsController.setErrorFreq(serverName, res)) {
      res.sendStatus(500)
      return
    }
    csv()
      .fromFile(csvFilePath)
      .then((lines: Item[]) => {
        const line = lines.map(line => ({
          id: line.id,
          title: line.title,
          description: line.description,
          image: line.image,
          expectedDeliveryDate: line.expected_delivery_date,
          seller: line.seller,
          sellerImage: line.seller_image
        })).find(line => line.id.toString() === id)
        if (line !== undefined) {
          res.json(line);
        } else {
          res.status(404).send('Could not find the id you requested');
        }
      }, (e: Error) => {
        res.status(500).send(`Sorry - was unable to open csv database: ${e.message}`);
      });

  }
  static ServerConfig(_req: Request, res: Response) {

    res.json(ItemsController.server)
    return
  }
  static allItems(req: any, res: Response) {
    if (!ItemsController.setErrorFreq(req.params.serverName, res)) {
      res.sendStatus(500)
      return
    }
    let { page = 0, size = 25 } = req.query
    page = parseInt(page)
    const object: any = {
      page: 0,
      totalPages: 0,
      totalItems: 0,
      items: [],
    }
    csv().fromFile(csvFilePath).then((myObj) => {
      object["page"] = page ? page : 0
      object["totalPages"] = Math.ceil(myObj.length / size)
      object["totalItems"] = myObj.length
      let arr = []
      let startPos = page * size
      for (let j = 0; j < size; j++) {
        if ((startPos + j) < myObj.length) {
          arr.push(myObj[startPos + j])
        }
      }

      arr = arr.map(line => ({
        id: line.id,
        title: line.title,
        description: line.description,
        image: line.image,
        expectedDeliveryDate: line.expected_delivery_date,
        seller: line.seller,
        sellerImage: line.seller_image
      }))
      object["items"] = arr;
      res.json(object)
    })
  }
  static quantity(req: any, res: Response) {
    const { id } = req.params
    if (!ItemsController.setErrorFreq(req.params.serverName, res)) {
      res.sendStatus(500)
      return
    }
    csv().fromFile(csvFilePath).then((myObj) => {
      const line = myObj.find(line => line.id === id)
      if (line) {
        if (line.quantity) {
          res.json(parseInt(line.quantity))
          return
        } else {
          res.sendStatus(404)
          return;
        }
      } else {
        res.sendStatus(404)
        return;
      }
    })
  } static price(req: any, res: Response) {
    if (!ItemsController.setErrorFreq(req.params.serverName, res)) {
      res.sendStatus(500)
      return
    }
    const { id } = req.params
    let quantity: number
    if (req.body.quantity) {
      quantity = req.body.quantity
    } else {
      res.sendStatus(400)
      return;
    }
    csv().fromFile(csvFilePath).then((myObj) => {
      const line = myObj.find(line => line.id === id)
      if (line) {
        if (quantity > line.quantity) {
          res.sendStatus(400)
          return;
        }
        const price = line.price
        const totalPrice = price * quantity
        if(line.sale){
          let discount = line.sale.split(" for ")
          let discountTimes = Math.floor(quantity/discount[0])
          let total = totalPrice-(discountTimes*price)
          res.send(`${total.toFixed(2)} EUR`)
          return
        }
        res.send(`${totalPrice.toFixed(2)} EUR`)
        return;
      } else {
        res.sendStatus(404)
        return
      }
    })
  }
  static setConfig(req: any, res: Response) {
    if (req.body.servers) {
      if (Object.keys(req.body).length === 1 && req.body.servers.length > 0) {
        for (let x in req.body.servers) {
          if (Object.keys(req.body.servers[x]).length === 2) {
            if (typeof req.body.servers[x].name === "string" && req.body.servers[x].name.length > 0) {
              if (typeof req.body.servers[x].errorFrequency === "number" && req.body.servers[x].errorFrequency >= 0 && req.body.servers[x].errorFrequency <= 10) {
                continue;
              } else {
                res.sendStatus(400)
                return
              }
            } else {
              res.sendStatus(400)
              return
            }
          } else {
            res.sendStatus(400)
            return
          }
        }
      } else {
        res.sendStatus(400)
        return;
      }

      ItemsController.server = req.body
      res.send(ItemsController.server)
      return
    } else {
      res.sendStatus(400)
      return
    }
  }

}