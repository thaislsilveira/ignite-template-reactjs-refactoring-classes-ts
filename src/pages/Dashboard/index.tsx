import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';

import api from '../../services/api';

import { Header } from '../../components/Header';
import { Food } from '../../components/Food';
import { ModalAddFood } from '../../components/ModalAddFood';
import { ModalEditFood } from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

export function Dashboard () {

  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

   useEffect(() => {
    async function loadFoods(): Promise<void> {
      const response = await api.get('foods');

      setFoods(response.data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const response = await api.post('foods', {
        ...food,
        available: true,
      });

      setFoods([...foods, response.data]);
      toast.success('A comida foi salva com sucesso!');
    } catch (err) {
      toast.error(err.response.data.error);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const response = await api.put(`foods/${editingFood.id}`, {
        ...editingFood,
        ...food,
      });

      setFoods(
        foods.map(foodMapped =>
          foodMapped.id === editingFood.id ? { ...response.data } : foodMapped,
        ),
      );

      toast.success('A comida foi editada com sucesso!');
    } catch (err) {
      toast.error(err.response.data.error);
    }
  }

  async function handleDeleteFood(id: number): Promise<void> {
    try {
      await api.delete(`foods/${id}`);

      const updatedList = foods.filter(food => food.id !== id);

      setFoods(updatedList);

      toast.success('A comida foi excluída com sucesso!');
    } catch (err) {
      toast.error(err.response.data.error);
    }
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    toggleEditModal();
  }



  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />
     <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
       <ToastContainer />
      </>
    );
};
