package main

import "fmt"

type animal interface {
	introduce()
	makeSound()
}

type abstractAnimal struct {
	makeSound func()
}

func (a *abstractAnimal) introduce() {
	fmt.Print("Hi I am ")
	a.makeSound()
}

type dog struct {
	abstractAnimal
}

func newDog() *dog {
	d := &dog{}
	d.makeSound = d.makeSoundFunc
	return d
}

func (d *dog) makeSoundFunc() {
	fmt.Println("woof")
}

type cat struct {
	abstractAnimal
}

func newCat() *cat {
	c := &cat{}
	c.makeSound = c.makeSoundFunc
	return c
}

func (c *cat) makeSoundFunc() {
	fmt.Println("meow")
}

func main() {
	d := newDog()
	c := newCat()

	d.introduce()
	c.introduce()
}
